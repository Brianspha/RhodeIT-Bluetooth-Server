import time
import RPi.GPIO as GPIO

#to use Raspberry Pi board pin numbers
GPIO.setmode(GPIO.BOARD)
#GPIO.setup(20,GPIO.OUT)
#GPIO.setup(26,GPIO.OUT)
GPIO.setup(21,GPIO.OUT)
GPIO.setup(22,GPIO.OUT)

#turn on light 
GPIO.output(21,True)
GPIO.output(22,True)
#time.sleep(50)
GPIO.cleanup()
#print("Hey")