#! /usr/bin/env python
#-.- coding=utf8 -.-
from selenium import selenium
import unittest, time, re

class spec_2_6(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*chrome", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_2_6(self):
        sel = self.selenium
        sel.open("/portal")
        try: self.assertEqual("Start date (YYYY-MM-DD)", sel.get_text("css=#date_widget > label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("End date (YYYY-MM-DD)", sel.get_text("css=#date_widget > label:nth(1)"))
        except AssertionError, e: self.verificationErrors.append(str(e))
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
