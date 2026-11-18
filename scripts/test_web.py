"""Optional browser smoke test: pip install playwright; use a development Expo build and anonymous Supabase Auth."""
import os
import shutil
from pathlib import Path
from tempfile import gettempdir
from playwright.sync_api import sync_playwright, expect

url = os.environ.get('COMPRASFIT_TEST_URL', 'http://localhost:8081')
screenshots = Path(gettempdir()) / 'comprasfit-web'
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
        page.get_by_role('button', name='Entrar como visitante').click()
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
        favorite = page.get_by_role('button', name='Favoritar ', exact=False).first
        recipe = favorite.get_attribute('aria-label').removeprefix('Favoritar ')
        favorite.click()
        page.get_by_role('tab', name='Favoritos', exact=True).click()
        page.get_by_role('button', name=f'Ver receita: {recipe}', exact=True).click()
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
        assert 'Minha lista ComprasFit' in Path(downloaded.path()).read_text(encoding='utf-8')
        for width in (320, 768, 1440):
            page.set_viewport_size({'width': width, 'height': 900})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
        page.screenshot(path=str(screenshots / 'shopping-desktop.png'))
        page.get_by_role('button', name='Voltar ao início', exact=True).click()
        page.get_by_role('tab', name='Preferências', exact=True).click()
        page.get_by_role('switch', name='Tema escuro').click()
        page.wait_for_function("Object.keys(localStorage).some(k => k.startsWith('comprasfit:v2:') && JSON.parse(localStorage[k]).preferences.dark)")
        page.reload(wait_until='domcontentloaded')
        expect(page.get_by_text('Seu cardápio', exact=True)).to_be_visible()
        page.get_by_role('tab', name='Favoritos', exact=True).click()
        expect(page.get_by_text(recipe, exact=True)).to_be_visible()
        page.get_by_role('tab', name='Configurações', exact=True).click()
        page.get_by_role('button', name='Redefinir preferências e favoritos', exact=True).click()
        page.get_by_role('button', name='Sim, redefinir', exact=True).click()
        page.get_by_role('tab', name='Favoritos', exact=True).click()
        expect(page.get_by_text('Toque no coração', exact=False)).to_be_visible()
        assert not errors, errors
        print(f'PASS: onboarding at {initial_width}px; 5 widths; recipes; favorites; checklist; download; theme; persistence; reset', flush=True)
        page.close()
    browser.close()
