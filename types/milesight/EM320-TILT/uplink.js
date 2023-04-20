// Parse Hex Byte Array
function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  const decoded = {};
  const lifecycle = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];
    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // ANGLE
    else if (channelId === 0x03 && channelType === 0xd4) {
      decoded.xAngle =
        (readInt16LE(Array.from(bytes).slice(i, i + 2)) >> 1) / 100;
      decoded.yAngle =
        (readInt16LE(Array.from(bytes).slice(i + 2, i + 4)) >> 1) / 100;
      decoded.zAngle =
        (readInt16LE(Array.from(bytes).slice(i + 4, i + 6)) >> 1) / 100;
      decoded.xThresholdReached = (bytes[i] & 0x01) === 0x01;
      decoded.yThresholdReached = (bytes[i + 2] & 0x01) === 0x01;
      decoded.zThresholdReached = (bytes[i + 4] & 0x01) === 0x01;
      i += 6;
    } else {
      break;
    }
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }
}
