function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const lifecycle = {};
  const occupancy = {};

  if (port === 1 || port === 2) {
    occupancy.occupancy = parseInt(`0x${payload}`, 16) & 0x01;
  }

  if (port === 3) {
    const resetDict = {
      0x01: "WATCHDOG_RESET",
      0x02: "POWER_ON_RESET",
      0x03: "SYSTEM_REQUEST_RESET",
      0x04: "OTHER_RESET",
    };
    lifecycle.debug = `Payload hex:${payload.substring(0, 24).toUpperCase()}`;
    lifecycle.fwVersion = `${parseInt(
      `0x${payload.substring(24, 26)}`,
      16,
    )}.${parseInt(`0x${payload.substring(26, 28)}`, 16)}.${parseInt(
      `0x${payload.substring(28, 30)}`,
      16,
    )}`;
    const resetCause = parseInt(`0x${payload.substring(30, 32)}`, 16);
    lifecycle.resetCause = resetDict[resetCause];
    occupancy.occupancy = parseInt(`0x${payload.substring(32, 34)}`, 16) & 0x01;

    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (port === 1 || port === 2 || port === 3) {
    emit("sample", { data: occupancy, topic: "occupancy" });
  }
}
