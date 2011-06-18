from selenium import selenium
import unittest, time, re

class spec_2_5_1(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*safari", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_2_5_1(self):
        sel = self.selenium
        sel.open("/portal")
        try: self.failUnless(sel.is_checked("//*[@id=\"filter_platform_Radarsat-1\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.failUnless(sel.is_checked("//*[@id=\"filter_platform_ERS-1\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.failUnless(sel.is_checked("//*[@id=\"filter_platform_ERS-2\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.failUnless(sel.is_checked("//*[@id=\"filter_platform_JERS-1\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.failUnless(sel.is_checked("//*[@id=\"filter_platform_ALOS\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
