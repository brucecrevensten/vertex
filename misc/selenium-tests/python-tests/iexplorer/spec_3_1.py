from selenium import selenium
import unittest, time, re

class spec_3_1(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*iehta", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_3_1(self):
        sel = self.selenium
        sel.open("/portal")
        for i in range(60):
            try:
                if sel.is_text_present("26056"): break
            except: pass
            time.sleep(1)
        else: self.fail("time out")
        try: self.assertEqual("Granule Name", sel.get_text("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th/div"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Processing", sel.get_text("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[2]/div"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Platform", sel.get_text("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[3]/div"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Orbit", sel.get_text("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[4]/div"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Frame", sel.get_text("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[5]/div"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Center Latitude/Longitude", sel.get_text("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[6]/div"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Acquisition Date", sel.get_text("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[7]/div"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Tools", sel.get_text("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[8]/div"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("26056", sel.get_text("css=td:nth(3)"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        sel.click("css=img[title=ALPSRP260561290]")
        try: self.assertEqual("Frame: 1290", sel.get_text("css=#product_profile > div > ul > li:nth(2)"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("", sel.get_text("//div[@id='product_profile']/div/img"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        sel.click("//div[3]/div[1]/a/span")
        try: self.assertEqual("L1.0", sel.get_text("//table[@id='results']/tbody/tr[1]/td[2]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("ALOS", sel.get_text("//table[@id='results']/tbody/tr[1]/td[3]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("26056", sel.get_text("//table[@id='results']/tbody/tr[1]/td[4]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("1290", sel.get_text("//table[@id='results']/tbody/tr[1]/td[5]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("64.6328, -147.7984", sel.get_text("//table[@id='results']/tbody/tr[1]/td[6]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("2010-12-15", sel.get_text("//table[@id='results']/tbody/tr[1]/td[7]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Download", sel.get_text("//table[@id='results']/tbody/tr/td[8]/a/span[2]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Add to queue", sel.get_text("//table[@id='results']/tbody/tr/td[8]/button"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        sel.click("css=span.ui-icon.ui-icon-closethick")
        try: self.assertEqual("Download", sel.get_text("link=Download"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        sel.click("css=span.ui-icon.ui-icon-closethick")
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
