function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  const len = bytes.length;
  lifecycle.batteryVoltage = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;

  let batteryLevel =
    Math.round((data.batteryVoltage - 2.45) / 0.0115 / 10) * 10;

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  if (len === 5) {
    const distance = (bytes[2] << 8) | bytes[3];
    data.distance = distance;
    if (distance < 20) {
      data.distance = "INVALID_READING";
    }
  } else {
    data.distance = "NO_DISTANCE";
  }

  data.interrupt = bytes[len - 1];

  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
