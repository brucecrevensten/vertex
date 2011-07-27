from selenium import selenium
import unittest, time, re

class spec_2_7(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*googlechrome", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_2_7(self):
        sel = self.selenium
        sel.open("/portal")
        sel.click("link=Path/Frame")
        try: self.assertEqual("Path", sel.get_text("//div[@id='filters']/div[5]/div/label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Frame", sel.get_text("//div[@id='filters']/div[5]/div/label[2]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        sel.type("filter_path", "255-300")
        sel.type("filter_frame", "1290-1300")
        for i in range(60):
            try:
                if sel.is_text_present("26056"): break
            except: pass
            time.sleep(1)
        else: self.fail("time out")
        try: self.assertEqual("26056", sel.get_text("css=td:nth(3)"))
        except AssertionError, e: self.verificationErrors.append(str(e))
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
