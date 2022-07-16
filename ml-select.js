const { spawn } = require('child_process');
module.exports = function (RED) {


    let sharedPythonBuffer = ""
    let child = null
    function StartChild() {
        let child = spawn('python3', ['/home/pi/custom-nodes/node-red-contrib-ml-select/AudioDetectionDeamon/AudioDeamon.py']); // ToDo: this is VERY ugly needs to be changed 
        child.stdout.on('data', data => {
            sharedPythonBuffer = data.toString();
        });
        child.stderr.on('data', data => {
            console.log("Error", data.toString())
        });
        child.on('exit', (code) => {

            console.log("We are closing, something broke", code)
            child = null;
        });
    }



    function MlSelect(config) {
        RED.nodes.createNode(this, config);
        var node = this;




        function ProcessData() {
            let trigger = false;
            Data = sharedPythonBuffer.split(',');
            detectedClass = Data[0]
            DOA = Data[1]
            volume = Data[2]
            switch (config.volume) {
                case vloud:
                    if (volume > 3000) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;
                case loud:
                    if (volume > 1500 && volume <= 3000) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;

                case soft:
                    if (volume > 500 && volume <= 1500) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;
                case vsoft:
                    if (volume <= 500) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;
                case any:
                    trigger = true;
                    break;

                default:
                    break;
            }

            if (trigger) {
                node.send({ payload: 'go' });
            }

        }


        node.on('input', function (msg) {
            if (child === null) {
                StartChild();
            } else {
                ProcessData();
            }
        });




let interfavelHandle = setInterval(() => {
    ProcessData();
    
}, config.retrigger_window);

        node.on('close', function () {
            close
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