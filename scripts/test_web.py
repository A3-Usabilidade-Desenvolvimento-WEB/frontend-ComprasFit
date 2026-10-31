"""Optional browser smoke test: pip install playwright; serve dist on port 8090."""
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

url = os.environ.get('COMPRASFIT_TEST_URL', 'http://127.0.0.1:8090')
screenshots = Path('/tmp/comprasfit-web')
screenshots.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=shutil.which('chromium'), args=['--no-sandbox'])
    for initial_width in (320, 1440):
        page = browser.new_page(viewport={'width': initial_width, 'height': 900})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(url, wait_until='domcontentloaded')
        start = page.get_by_role('button', name='Começar', exact=True)
        start.focus()
        page.keyboard.press('Enter')
        expect(page.get_by_role('button', name='Continuar', exact=True)).to_be_disabled()
        page.get_by_role('textbox', name='Seu nome').fill('Luiza')
        for _ in range(7):
            page.get_by_role('button', name='Continuar', exact=True).click()
        page.get_by_role('button', name='Montar minha semana').click()
        expect(page.get_by_text('Seu cardápio', exact=True)).to_be_visible()
        for width in (320, 390, 768, 1024, 1440):
            page.set_viewport_size({'width': width, 'height': 900})
            expect(page.get_by_role('tab', name='Início', exact=True)).to_be_visible()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
            cards = page.get_by_role('button', name='Ver receita:', exact=False)
            if width >= 700:
                assert cards.nth(1).bounding_box()['x'] > cards.nth(0).bounding_box()['x']
            else:
                assert cards.nth(1).bounding_box()['y'] > cards.nth(0).bounding_box()['y']
            page.screenshot(path=str(screenshots / f'home-{width}.png'))
        page.get_by_role('button', name='Favoritar Arroz com frango', exact=True).first.click()
        page.get_by_role('tab', name='Favoritos', exact=True).click()
        page.get_by_role('button', name='Ver receita: Arroz com frango', exact=True).click()
        expect(page.get_by_text('Ingredientes', exact=True)).to_be_visible()
        for width in (320, 768, 1440):
            page.set_viewport_size({'width': width, 'height': 900})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
        page.screenshot(path=str(screenshots / 'recipe-desktop.png'))
        page.get_by_role('button', name='Voltar', exact=True).click()
        page.get_by_role('tab', name='Início', exact=True).click()
        page.get_by_role('button').filter(has_text='Lista de').click()
        checkbox = page.get_by_role('checkbox').first
        checkbox.click()
        expect(checkbox).to_have_attribute('aria-checked', 'true')
        with page.expect_download() as event:
            page.get_by_role('button', name='Baixar lista de compras', exact=True).click()
        downloaded = event.value
        assert downloaded.suggested_filename == 'lista-comprasfit.txt'
        assert 'Brócolis' in Path(downloaded.path()).read_text()
        for width in (320, 768, 1440):
            page.set_viewport_size({'width': width, 'height': 900})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
        page.screenshot(path=str(screenshots / 'shopping-desktop.png'))
        page.get_by_role('button', name='Voltar ao início', exact=True).click()
        page.get_by_role('tab', name='Preferências', exact=True).click()
        page.get_by_role('switch', name='Tema escuro').click()
        page.wait_for_function("JSON.parse(localStorage.getItem('comprasfit:v1')).preferences.dark")
        page.reload(wait_until='domcontentloaded')
        expect(page.get_by_text('Seu cardápio', exact=True)).to_be_visible()
        page.get_by_role('tab', name='Favoritos', exact=True).click()
        expect(page.get_by_text('Arroz com frango', exact=True)).to_be_visible()
        page.get_by_role('tab', name='Configurações', exact=True).click()
        page.get_by_role('button', name='Apagar dados deste dispositivo', exact=True).click()
        page.get_by_role('button', name='Sim, apagar dados', exact=True).click()
        expect(page.get_by_role('button', name='Começar', exact=True)).to_be_visible()
        assert not errors, errors
        print(f'PASS: onboarding at {initial_width}px; 5 widths; recipes; favorites; checklist; download; theme; persistence; reset', flush=True)
        page.close()
    browser.close()
