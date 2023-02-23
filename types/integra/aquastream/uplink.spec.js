const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Aquastream uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let alarmSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/alarm.schema.json`).then((parsedSchema) => {
      alarmSchema = parsedSchema;
      done();
    });
  });

  let deviceSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/device.schema.json`).then((parsedSchema) => {
      deviceSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Aquastream payload", () => {
      const data = {
        data: {
          payloadHex:
            "2D44B42509930310050E7221535104B4250107010000200413E02E00008410130000000002FD17000002FD74CB16",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.backflow, 0);
        assert.equal(value.data.volume, 12000);
        assert.equal(value.data.volumeM3, 12);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");

        assert.equal(value.data.batteryLow, false);
        assert.equal(value.data.burst, false);
        assert.equal(value.data.leak, false);
        assert.equal(value.data.noConsumption, false);
        assert.equal(value.data.overflow, false);
        assert.equal(value.data.reverseFlow, false);
        assert.equal(value.data.tamper, false);

        utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "device");

        assert.equal(value.data.batteryLifetime, 5835);
        assert.equal(value.data.configuration, "0020");
        assert.equal(value.data.manufacturerCode, "25B4");
        assert.equal(value.data.meterAddress, "04515321");
        assert.equal(value.data.meterVersion, "01");
        assert.equal(value.data.moduleNumber, "10039309");
        assert.equal(value.data.statusField, "00");
        assert.equal(value.data.systemComponent, "0E");
        assert.equal(value.data.transmitionCounter, "01");
        assert.equal(value.data.versionNumber, "05");
        assert.equal(value.data.waterType, "07");

        utils.validateSchema(value.data, deviceSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
