from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def test_aiken_spider():
    print("Starting Aiken spider test...")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--remote-debugging-port=9222")
    chrome_options.add_argument("--window-size=1920,1080")
    
    try:
        print("Initializing Chrome driver...")
        driver = webdriver.Chrome(options=chrome_options)
        
        print("Chrome driver initialized successfully.")
        print(f"Chrome version: {driver.capabilities['browserVersion']}")
        print(f"ChromeDriver version: {driver.capabilities['chrome']['chromedriverVersion'].split(' ')[0]}")
        
        print("Navigating to https://aiken-lang.org/credits...")
        driver.get("https://aiken-lang.org/credits")
        
        print("Waiting for sidebar links...")
        sidebar_links = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "nav[aria-label='Sidebar'] a"))
        )
        
        print(f"Found {len(sidebar_links)} sidebar links.")
        for link in sidebar_links:
            print(f"Link text: {link.text}, href: {link.get_attribute('href')}")
        
        print("Trying to find current link...")
        current_link = driver.find_elements(By.CSS_SELECTOR, "nav[aria-label='Sidebar'] a[aria-current='page']")
        if current_link:
            print(f"Current link: {current_link[0].text}")
            current_index = [link.text for link in sidebar_links].index(current_link[0].text)
            print(f"Current link index: {current_index}")
        else:
            print("Current link not found.")
        
        print("Test completed successfully.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
    finally:
        if 'driver' in locals():
            driver.quit()
            print("Chrome driver closed.")

if __name__ == "__main__":
    test_aiken_spider()
