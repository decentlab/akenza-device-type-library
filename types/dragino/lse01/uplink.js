function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  const batteryVoltage = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  lifecycle.batteryVoltage = batteryVoltage / 1000;

  let temperature = (bytes[2] << 8) | bytes[3];
  if (bytes[2] & 0x80) {
    temperature |= 0xffff0000;
  }
  data.temperature = Number((temperature / 10).toFixed(2));

  const soilHumidity = (bytes[4] << 8) | bytes[5];
  data.soilHumidity = Number((soilHumidity / 100).toFixed(2));

  let soilTemperature = (bytes[6] << 8) | bytes[7];
  if ((soilTemperature & 0x8000) >> 15 === 0) {
    soilTemperature = (soilTemperature / 100).toFixed(2);
  } else if ((soilTemperature & 0x8000) >> 15 === 1) {
    soilTemperature = ((soilTemperature - 0xffff) / 100).toFixed(2);
  }
  data.soilTemperature = Number(soilTemperature);

  data.soilConductivity = (bytes[8] << 8) | bytes[9];

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
