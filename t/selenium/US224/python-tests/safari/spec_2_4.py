#! /usr/bin/env python
#-.- coding=utf8 -.-
from selenium import selenium
import unittest, time, re

class spec_2_4(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*safari", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_2_4(self):
        sel = self.selenium
        sel.open("/portal")
        try: self.assertEqual("L0", sel.get_text("//html/body/div/div/div/div/div[2]/ul/li[1]/label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("L1", sel.get_text("//html/body/div/div/div/div/div[2]/ul/li[2]/label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("L1.0", sel.get_text("//html/body/div/div/div/div/div[2]/ul/li[3]/label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("L1.1", sel.get_text("//html/body/div/div/div/div/div[2]/ul/li[4]/label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("L1.5", sel.get_text("//html/body/div/div/div/div/div[2]/ul/li[5]/label"))
        except AssertionError, e: self.verificationErrors.append(str(e))
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
