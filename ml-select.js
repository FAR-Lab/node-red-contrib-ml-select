const { spawn } = require('child_process');

module.exports = function (RED) {
    
    let pythonRunning = true;
    let sharedPythonBuffer = ""
    let child = spawn('python3', ['test.py']);

    child.stdout.on('data', data => {
        sharedPythonBuffer=data.toString();
        
    });
    child.on('exit', (code) => {
        pythonRunning = false;
        console.log("We are closing, something broke",code)
    });



    function MlSelect(config) {
        let childRunning = false;
        let child = null;

        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            msg.payload = sharedPythonBuffer;
            node.send(msg);
        });


        node.on('close', function () {
            
            if (pythonRunning) {
                node.warn("Child is not null and child is Running")
                try {
                    child.kill();
                    child = null;
                } catch (error) {
                    console.log("Was trying to kill the child but it faild.")
                }
                
                pythonRunning = false;
            }
        });
    }



    RED.nodes.registerType("ml-select", MlSelect, {
        settings: {
            sampleNodeColour: {
                value: "red",
                exportable: true
            }
        }
    });
}