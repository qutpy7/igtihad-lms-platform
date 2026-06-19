import time
from playwright.sync_api import sync_playwright

def verify_frontend():
    print("Starting verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create context to record video
        context = browser.new_context(record_video_dir="videos/")
        page = context.new_page()

        # Navigate to login page
        print("Navigating to login page...")
        page.goto("http://localhost:5173/login")
        page.wait_for_load_state("networkidle")

        print("Locating password toggle button...")
        # Get the toggle button using aria-label
        toggle_button = page.locator('button[aria-label="إظهار كلمة المرور"]')

        if toggle_button.count() == 0:
            print("ERROR: Toggle button not found.")
            browser.close()
            return

        print("Toggle button found. Current state is hidden.")
        page.screenshot(path="screenshot_hidden.png")

        print("Clicking toggle button...")
        toggle_button.click()

        # Wait for state change
        time.sleep(1)

        # Check if aria-label changed
        toggle_button_visible = page.locator('button[aria-label="إخفاء كلمة المرور"]')
        if toggle_button_visible.count() == 0:
             print("ERROR: Toggle button state did not change to visible.")
        else:
             print("Toggle button state changed correctly.")
             page.screenshot(path="screenshot_visible.png")

        # Find password input and check type attribute
        password_input = page.locator('input[placeholder="••••••••"]')
        input_type = password_input.get_attribute("type")
        print(f"Password input type is now: {input_type}")

        context.close()
        browser.close()
        print("Verification complete.")

if __name__ == '__main__':
    verify_frontend()
