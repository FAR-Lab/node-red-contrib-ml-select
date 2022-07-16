from sys import stdout
import time
stringTest = "Hello to all my node brothers!"
while(True):
    stdout.write(stringTest+str(time.monotonic()))
    stdout.flush()
    time.sleep(1)


