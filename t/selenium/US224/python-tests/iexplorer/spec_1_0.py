#! /usr/bin/env python
#-.- coding=utf8 -.-
from selenium import selenium
import unittest, time, re

class spec_1_0(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*iehta", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_1_0(self):
        sel = self.selenium
        sel.open("/portal")
        self.assertEqual("http://testapi.daac.asf.alaska.edu/portal", sel.get_location())
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
