#! /usr/bin/env python
#-.- coding=utf8 -.-
from selenium import selenium
import unittest, time, re

class spec_1_2(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*chrome", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_1_2(self):
        sel = self.selenium
        sel.open("/portal")
        try: self.failUnless(sel.is_element_present("//*[@id=\"searchMap\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
