# simple_node

## Unanswered Questions:
 * What to do about the RPI shortage?
 *  Use Just a laptop with two USB attachemnts?(not as simplistic)
 *  order a different PI
 * how do we deal with the IP address finding issue for the RPI?
 * How do we deal with the mis matched sound quality beween `training` microphone and `inference` microphone 
 * can we run node-red ?? in a light virtual mashine? 
    => should we give everyone a usb stick





## ToDo List :
 **Must**
 * Add relative weights for the machine learing algorythm
 * compute sound lelvel change over time (getting louder etc.) (In python)
 * Add missing logic to the `ProcessData` fucntion to include the missing selected features
 * change angle selection to 4 (or 5) buttons `Left` `Front`  `Right` `behind` maybe `any`
 * Restart python child after uploading a new model file.
 * Show the childs process state in the node-red interface
**Should:**
 * name everything corectly 
 * remove unwanted nodes 
 * Make it easy to show what the system is detecting at the moment (*for all variables)
 * Optimize python code to only load required tf and tfjs functions.

**Probably not:**
* Make a new image (64bit) 
