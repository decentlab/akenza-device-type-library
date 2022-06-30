const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Dragino LHT65 Uplink", () => {
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

  let externalSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/external.schema.json`)
      .then((parsedSchema) => {
        externalSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Dragino LHT65 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "cc2c0a2901dc017fff7fff",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.batteryStatus, 3);
        assert.equal(value.data.connectionStatus, "CONNECTED");
        assert.equal(value.data.externalSensor, true);
        assert.equal(value.data.humidity, 47.6);
        assert.equal(value.data.temperature, 26.01);
        assert.equal(value.data.voltage, 3.116);

        validate(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "external");
        assert.equal(value.data.externalTemperature, 327.67);

        validate(value.data, externalSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
