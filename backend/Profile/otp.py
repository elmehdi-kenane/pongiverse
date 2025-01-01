import time
import pyotp
import qrcode

# key = pyotp.random_base32() #Create a random 32 key that will be using it to create a otp (one time password)
key = "TSDUCNJUHDB6SFQQS4BXBSZ3OICFS2OC"
user = "IMAD"

totp = pyotp.TOTP(key) #TimeBase one time password: to each 30s time generate a new otp

#printkey)
#printtotp.now())

# Testing if the otp will be changed after 30s -------------------------------
# time.sleep(30) 
# #printtotp.now())


# Testing if we have the correct otp -------------------------------
# input_code = input("Enter TFQ code:")
# #print"result :", totp.verify(input_code)) # Test if you have the right otp


# Create a qrcode image based on the key -------------------------------
# urc = pyotp.totp.TOTP(key).provisioning_uri(name=user, issuer_name="Transcendence")  
# qrcode.make(urc).save("IMAD_QR.png")

while True:
    input_code = input("Enter TFQ code :")
    #printtotp.verify(input_code))