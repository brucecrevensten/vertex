from selenium import selenium
import unittest, time, re

class spec_3_2(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*googlechrome", "http://testapi.daac.asf.alaska.edu/portal")
        self.selenium.start()
    
    def test_spec_3_2(self):
        sel = self.selenium
        sel.open("/portal")
        for i in range(60):
            try:
                if sel.is_text_present("26056"): break
            except: pass
            time.sleep(1)
        else: self.fail("time out")
        try: self.assertEqual("DataTables_sort_wrapper", sel.get_attribute("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[2]/div@class"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("DataTables_sort_wrapper", sel.get_attribute("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[2]/div@class"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("DataTables_sort_wrapper", sel.get_attribute("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[3]/div@class"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("DataTables_sort_wrapper", sel.get_attribute("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[4]/div@class"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("DataTables_sort_wrapper", sel.get_attribute("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[5]/div@class"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("DataTables_sort_wrapper", sel.get_attribute("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[6]/div@class"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("DataTables_sort_wrapper", sel.get_attribute("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[7]/div@class"))
        except AssertionError, e: self.verificationErrors.append(str(e))
        try: self.assertEqual("DataTables_sort_wrapper", sel.get_attribute("//html/body/div[2]/div/div[4]/div[5]/div/div[2]/div/div/table/thead/tr/th[8]/div@class"))
        except AssertionError, e: self.verificationErrors.append(str(e))
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
