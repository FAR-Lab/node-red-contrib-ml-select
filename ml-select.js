const { spawn } = require('child_process');
const path = require('path');

module.exports = function (RED) {


    let sharedPythonBuffer = "";
    let child = null;

    function StartChild() {
        if (child != null && child?.exitCode
            == null) {
            console.log("Killing the current child.")
            child.kill()
            child = null;
        }

        child = spawn('python3', [path.join(__dirname,'/AudioDetectionDeamon/AudioDeamon.py')]); // ToDo: this is VERY ugly needs to be changed 
        child.stdout.on('data', data => {
            sharedPythonBuffer = data.toString();
            console.log("got Data updated SharedBuffer")
        });
        child.stderr.on('data', data => {
            console.log("Error", data.toString())
        });
        child.on('exit', (code) => {

            console.log("We are closing, something broke", code)
            child = null;
        });
    }

    StartChild();

    function MlSelect(config) {
        RED.nodes.createNode(this, config);
        var node = this;




        function ProcessData() {
            let trigger = false;
            Data = sharedPythonBuffer.split(',');
            if (Data.length != 3) {
                //node.warn("Not the correct buffer yet"+Data.length.toString())
                return;
            }
            detectedClass = Data[0]
            DOA = Number(Data[2])
            volume = Number(Data[1])
            switch (config.volume) {
                case "vloud":
                    if (volume > 3000) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;
                case "loud":
                    if (volume > 1500 && volume <= 3000) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;

                case "soft":
                    if (volume > 500 && volume <= 1500) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;
                case "vsoft":
                    if (volume <= 500) {
                        trigger = true;
                    } else {
                        trigger = false;
                    }
                    break;
                case "any":
                    trigger = true;
                    break;

                default:
                    break;
            }

            if (trigger) {
                node.send({ payload: 'go' });
            } else {

            }

        }


        node.on('input', function (msg) {
            if (child == null || (child != null && child.exitCode != null)) {
                node.warn("Starting a new child as it was NULL or had died!");

                StartChild();
            } else {
                ProcessData();
            }
        });




        let interfavelHandle = setInterval(() => {



            ProcessData();

        }, config.retrigger_window * 1000);

        node.on('close', function () {
            clearInterval(interfavelHandle)
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