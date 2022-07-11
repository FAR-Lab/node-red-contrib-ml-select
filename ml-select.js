module.exports = function (RED) {
    const { spawn } = require('child_process');

    let sharedPythonBuffer = []
    let pythonRunning = false;

    function MlSelect(config) {
        let childRunning = false;
        let child = null;
        const id = setInterval(() => {
            if (!pythonRunning) {
                
                node.warn("Spawning Child")
                pythonRunning = true;
                child = spawn('python', ['test.py']);
                child.on('exit', (code) => {
                    node.warn("Child Closed Itself")
                    childRunning = false;
                });
                childRunning = true;
                child.stdout.on('data', data => {
                    node.warn(`stderr: ${data}`);
                    sharedPythonBuffer.push(data);

                });
            }
            else {
                node.warn("I did not spawn a child process")
            }
        }, 5000)

        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            msg.pythonBuffer = sharedPythonBuffer;
            node.send(msg);
        });


        node.on('close', function () {
            clearInterval(id);
            node.warn("Closed this Node")
            node.warn("Child is not null: " + (!child===null))
            node.warn("Child is running: " + childRunning)
            if (!child === null && childRunning) {
                node.warn("Child is not null and child is Running")
                child.kill();
                child = null;
                childRunning = false;
                pythonRunning = false;
            }
            else if(!child === null && !childRunning)
            {
                node.warn("Child is not null and child is not Running")
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