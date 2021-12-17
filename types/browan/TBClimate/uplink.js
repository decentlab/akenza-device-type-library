function toLittleEndian(hex, signed) {
  // Creating little endian hex DCBA
  const hexArray = [];
  let tempHex = hex;
  while (tempHex.length >= 2) {
    hexArray.push(tempHex.substring(0, 2));
    tempHex = tempHex.substring(2, tempHex.length);
  }
  hexArray.reverse();

  if (signed) {
    return Bits.bitsToSigned(Bits.hexToBits(hexArray.join("")));
  }
  return Bits.bitsToUnsigned(Bits.hexToBits(hexArray.join("")));
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  data.open = !!Bits.bitsToUnsigned(bits.substr(0, 8));

  lifecycle.voltage = Bits.bitsToUnsigned(bits.substr(8, 4));
  lifecycle.voltage = (25 + lifecycle.voltage) / 10;
  lifecycle.voltage = Math.round(lifecycle.voltage * 10) / 10;

  lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(12, 4));
  lifecycle.batteryLevel = 100 * (lifecycle.batteryLevel / 15);
  lifecycle.batteryLevel = Math.round(lifecycle.batteryLevel);

  data.temperature = Bits.bitsToUnsigned(bits.substr(17, 7));
  data.temperature -= 32;

  data.humidity = Bits.bitsToUnsigned(bits.substr(25, 7));

  data.co2 = toLittleEndian(payload.substr(8, 4), false);
  data.voc = toLittleEndian(payload.substr(12, 4), false);

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
