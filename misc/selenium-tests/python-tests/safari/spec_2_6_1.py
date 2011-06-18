from selenium import selenium
import unittest, time, re

class spec_2_6_1(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*safari", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_2_6_1(self):
        sel = self.selenium
        sel.open("/portal")
        sel.click("link=Date")
        sel.click("filter_start")
        sel.click("link=4")
        try: self.assertEqual("2010-12-04", sel.get_value("filter_start"))
        except AssertionError, e: self.verificationErrors.append(str(e))
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
