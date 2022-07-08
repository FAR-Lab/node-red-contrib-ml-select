module.exports = function(RED) {
    function MlSelect(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.warn(config.retrigger_window)
        node.warn(config.files)
        node.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });
    }
   

    RED.nodes.registerType("ml-select",MlSelect, {
    settings: {
        sampleNodeColour: {
            value: "red",
            exportable: true
            }
        }
    });
}