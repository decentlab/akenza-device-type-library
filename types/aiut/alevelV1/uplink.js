function consume(event) {
  const payload = event.data.payload_hex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  data.currentLevel = Bits.bitsToUnsigned(bits.substr(0, 10)) / 10;
  data.tankingFlag = !!Bits.bitsToUnsigned(bits.substr(10, 1));
  data.emptingFlag = !!Bits.bitsToUnsigned(bits.substr(11, 1));
  data.measurementError = !!Bits.bitsToUnsigned(bits.substr(12, 1));
  data.outOfRangeError = !!Bits.bitsToUnsigned(bits.substr(13, 1));
  data.sequenceNumber = Bits.bitsToUnsigned(bits.substr(14, 2));

  lifecycle.voltage = (Bits.bitsToUnsigned(bits.substr(16, 8)) + 150) / 100;
  lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(24, 8));
  data.temperature = Bits.bitsToSigned(bits.substr(32, 8));
  lifecycle.deviceStatusFlag = Bits.bitsToUnsigned(bits.substr(40, 8));

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "default" });
}
