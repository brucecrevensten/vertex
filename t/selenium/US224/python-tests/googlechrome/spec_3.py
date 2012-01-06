from selenium import selenium
import unittest, time, re

class spec_3(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*googlechrome", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_3(self):
        sel = self.selenium
        sel.open("/portal")
        for i in range(60):
            try:
                if sel.is_text_present("26056"): break
            except: pass
            time.sleep(1)
        else: self.fail("time out")
        try: self.failUnless(sel.is_element_present("//*[@id=\"results_wrapper\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("dataTables_wrapper", sel.get_attribute("//*[@id=\"results_wrapper\"]@class"))
        except AssertionError, e: self.verificationErrors.append(str(e))
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
