from selenium import selenium
import unittest, time, re

class spec_2_9(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*googlechrome", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_2_9(self):
        sel = self.selenium
        sel.open("/portal")
        sel.click("link=Direction")
        try: self.assertEqual("Any", sel.get_text("//div[@id='filter_direction']/ul/li[1]/label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Ascending", sel.get_text("//div[@id='filter_direction']/ul/li[2]/label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("Descending", sel.get_text("//div[@id='filter_direction']/ul/li[3]/label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("on", sel.get_value("filter_direction_Any"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        sel.click("filter_direction_Ascending")
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
