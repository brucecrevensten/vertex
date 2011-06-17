from selenium import selenium
import unittest, time, re

class spec_3_3(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*chrome", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_3_3(self):
        sel = self.selenium
        sel.open("/portal")
        try: self.assertEqual("", sel.get_text("//div[@id='async-spinner']/p/span"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual(u"Loading search results\u2026", sel.get_text("//div[@id='async-spinner']/p/strong"))
        except AssertionError, e: self.verificationErrors.append(str(e))
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
