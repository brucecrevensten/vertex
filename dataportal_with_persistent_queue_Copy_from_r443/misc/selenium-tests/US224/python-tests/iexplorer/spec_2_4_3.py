#! /usr/bin/env python
#-.- coding=utf8 -.-
from selenium import selenium
import unittest, time, re

class spec_2_4_3(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*iehta", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_2_4_3(self):
        sel = self.selenium
        sel.open("/portal")
        try: self.failUnless(sel.is_checked("//*[@id=\"filter_processing_L0\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.failUnless(sel.is_checked("//*[@id=\"filter_processing_L1\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.failUnless(sel.is_checked("//*[@id=\"filter_processing_L1.0\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.failUnless(sel.is_checked("//*[@id=\"filter_processing_L1.1\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.failUnless(sel.is_checked("//*[@id=\"filter_processing_L1.5\"]"))
        except AssertionError, e: self.verificationErrors.append(str(e))
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
