#! /usr/bin/env python
#-.- coding=utf8 -.-
from selenium import selenium
import unittest, time, re

class spec_2_5(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*chrome", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_2_5(self):
        sel = self.selenium
        sel.open("/portal")
        try: self.assertEqual("Radarsat-1", sel.get_text("css=#filter_platform > ul > li > label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("ERS-1", sel.get_text("css=#filter_platform > ul > li:nth(1) > label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("ERS-2", sel.get_text("css=#filter_platform > ul > li:nth(2) > label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("JERS-1", sel.get_text("css=#filter_platform > ul > li:nth(3) > label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("ALOS", sel.get_text("css=#filter_platform > ul > li:nth(4) > label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("on", sel.get_value("filter_platform_Radarsat-1"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("on", sel.get_value("filter_platform_ERS-1"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("on", sel.get_value("filter_platform_ERS-2"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("on", sel.get_value("filter_platform_JERS-1"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("on", sel.get_value("filter_platform_ALOS"))
        except AssertionError, e: self.verificationErrors.append(str(e))
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
