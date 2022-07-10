module.exports = function (RED) {
    const { spawn } = require('child_process');

    let sharedPythonBuffer = []
    let pythonRunning = false;

    function MlSelect(config) {
        let child = null;
        setInterval(() => {
            if (!pythonRunning) {
                pythonRunning = true;
                child = spawn('python', ['test.py']);
                child.stdout.on('data', data => {
                    node.warn(`stderr: ${data}`);
                    const floatArray = new Float32Array(data.buffer);
                    sharedPythonBuffer.push(floatArray[0]);
                });
            }
        }, 250)

        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            if (boolFlag) {
                testString = config.name;
                boolFlag = false;
            }
            msg.testsString = testString;
            msg.pythonBuffer = sharedPythonBuffer;
            node.send(msg);
        });

        node.on('close', function () {
            if (child) {
                child.kill();
                child = null;
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