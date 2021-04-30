// Decoder Gateway Protocol Version 0.02
function swap16(val) {
  return ((val & 0xFF) << 8) |
    ((val >> 8) & 0xFF);
}

function swap32(val) {
  return (((val << 24) & 0xff000000) |
    ((val << 8) & 0x00ff0000) |
    ((val >> 8) & 0x0000ff00) |
    ((val >> 24) & 0x000000ff));
}

function bytesToFloat(bytes) {
  var bits_float = bytes;
  var sign = (bits_float >>> 31 === 0) ? 1.0 : -1.0;
  var e = bits_float >>> 23 & 0xff;
  var m = (e === 0) ? (bits_float & 0x7fffff) << 1 : (bits_float & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

function getByte(buff, nr) {
  return Bits.bitsToUnsigned(buff.substr(nr * 8, 8));
}

function getWord(buff, nr) {
  return swap16(Bits.bitsToUnsigned(buff.substr(nr * 8, 16)));
}

function getLong(buff, nr) {
  return swap32(Bits.bitsToUnsigned(buff.substr(nr * 8, 32)));
}

function getFloat(buff, nr) {
  return bytesToFloat(getLong(buff, nr));
}

function consume(event) {

  var payload_hex = event.data.payload_hex;
  var buff = Bits.hexToBits(payload_hex);

  var data_size = payload_hex.length / 2;

  var data = {};
  var lifecycle = {};

  var rd_pos = 0;

  do {
    var para_size = getByte(buff, rd_pos++) & 0x3F;  // get size
    var para_type = getByte(buff, rd_pos++);  // get type

    switch (para_type) {
      case 1:
        lifecycle.protocol_version = "Version: " + getByte(buff, rd_pos + 1) + "." + getByte(buff, rd_pos);
        break;
      case 2:
        lifecycle.app_version = "Version: " + getByte(buff, rd_pos + 2) + "." + getByte(buff, rd_pos + 1) + "p" + getByte(buff, rd_pos);
        break;
      case 3:
        lifecycle.lora_stack_version = "Version: " + getByte(buff, rd_pos + 2) + "." + getByte(buff, rd_pos + 1) + "." + getByte(buff, rd_pos);
        break;
      case 4:
        lifecycle.lora_version = "Version: " + getByte(buff, rd_pos + 2) + "." + getByte(buff, rd_pos + 1) + "." + getByte(buff, rd_pos);
        break;
      case 6:
        switch (getByte(buff, rd_pos)) {
          case 1: lifecycle.msg_cycle_time_1 = getWord(buff, rd_pos + 1); break;
          case 2: lifecycle.msg_cycle_time_2 = getWord(buff, rd_pos + 1); break;
          case 3: lifecycle.msg_cycle_time_3 = getWord(buff, rd_pos + 1); break;
          case 4: lifecycle.msg_cycle_time_4 = getWord(buff, rd_pos + 1); break;
          case 5: lifecycle.msg_cycle_time_5 = getWord(buff, rd_pos + 1); break;
          case 6: lifecycle.msg_cycle_time_6 = getWord(buff, rd_pos + 1); break;
          case 7: lifecycle.msg_cycle_time_7 = getWord(buff, rd_pos + 1); break;
          case 8: lifecycle.msg_cycle_time_8 = getWord(buff, rd_pos + 1); break;
        }
        break;
      case 7:
        lifecycle.group_address = getByte(buff, rd_pos);
        break;
      case 8:
        lifecycle.serial_number = getLong(buff, rd_pos);
        break;
      case 9:
        data.temperature = getWord(buff, rd_pos) / 100;
        break;
      case 10:
        data.humidity = getWord(buff, rd_pos) / 10;
        break;
      case 11:
        data.voc = getWord(buff, rd_pos);
        break;
      case 12:
        data.co2 = getWord(buff, rd_pos);
        break;
      case 13:
        data.eco2 = getWord(buff, rd_pos);
        break;
      case 14:
        lifecycle.iaq_state_int = getByte(buff, rd_pos);
        break;
      case 15:
        lifecycle.iaq_state_ext = getByte(buff, rd_pos);
        break;
      case 16:
        data.pm1_0 = getFloat(buff, rd_pos);
        break;
      case 17:
        data.pm2_5 = getFloat(buff, rd_pos);
        break;
      case 18:
        data.pm4_0 = getFloat(buff, rd_pos);
        break;
      case 19:
        data.pm10 = getFloat(buff, rd_pos);
        break;
      case 20:
        lifecycle.iaq_particel_typ_size = getFloat(buff, rd_pos);
        break;
      case 21:
        lifecycle.iaq_threshold_co2_good = getWord(buff, rd_pos);
        lifecycle.iaq_threshold_voc_good = getWord(buff, rd_pos + 2);
        break;
      case 22:
        lifecycle.iaq_threshold_co2_still_ok = getWord(buff, rd_pos);
        lifecycle.iaq_threshold_voc_still_ok = getWord(buff, rd_pos + 2);
        break;
      case 23:
        lifecycle.iaq_threshold_co2_bad = getWord(buff, rd_pos);
        lifecycle.iaq_threshold_voc_bad = getWord(buff, rd_pos + 2);
        break;
      case 24:
        lifecycle.iaq_filter_time = getByte(buff, rd_pos);
        lifecycle.iaq_hysteresis_co2 = getByte(buff, rd_pos + 1);
        lifecycle.iaq_hysteresis_voc = getByte(buff, rd_pos + 2);
        break;
      case 25:
        lifecycle.iaq_rgbw_good_red = getByte(buff, rd_pos);
        lifecycle.iaq_rgbw_good_green = getByte(buff, rd_pos + 1);
        lifecycle.iaq_rgbw_good_blue = getByte(buff, rd_pos + 2);
        break;
      case 26:
        lifecycle.iaq_rgbw_still_ok_red = getByte(buff, rd_pos);
        lifecycle.iaq_rgbw_still_ok_green = getByte(buff, rd_pos + 1);
        lifecycle.iaq_rgbw_still_ok_blue = getByte(buff, rd_pos + 2);
        break;
      case 27:
        lifecycle.iaq_rgbw_bad_red = getByte(buff, rd_pos);
        lifecycle.iaq_rgbw_bad_green = getByte(buff, rd_pos + 1);
        lifecycle.iaq_rgbw_bad_blue = getByte(buff, rd_pos + 2);
        break;
      case 28:
        lifecycle.iaq_rgbw_deadly_red = getByte(buff, rd_pos);
        lifecycle.iaq_rgbw_deadly_green = getByte(buff, rd_pos + 1);
        lifecycle.iaq_rgbw_deadly_blue = getByte(buff, rd_pos + 2);
        break;
      case 29:
        lifecycle.iaq_rgbw_warmup_red = getByte(buff, rd_pos);
        lifecycle.iaq_rgbw_warmup_green = getByte(buff, rd_pos + 1);
        lifecycle.iaq_rgbw_warmup_blue = getByte(buff, rd_pos + 2);
        break;
      case 30:
        lifecycle.iaq_rgbw_dimming = getByte(buff, rd_pos);
        break;
      case 31:
        lifecycle.iaq_visualisation = getByte(buff, rd_pos);
        break;
      case 32:
        data.altitude = getWord(buff, rd_pos);
        break;
      case 33:
        data.latitude = getFloat(buff, rd_pos);
        break;
      case 34:
        data.longitude = getFloat(buff, rd_pos);
        break;
      case 35:
        data.lightState = getByte(buff, rd_pos);
        break;
      case 37:
        lifecycle.light_set_cct = getWord(buff, rd_pos);
        break;
      case 38:
        lifecycle.light_set_lux = getWord(buff, rd_pos);
        break;
      case 39:
        lifecycle.light_light_level = getWord(buff, rd_pos);
        break;
      case 40:
        lifecycle.device_temperature = getByte(buff, rd_pos);
        break;
      case 41:
        lifecycle.error = getLong(buff, rd_pos);
        break;
      case 42:
        lifecycle.act_pwr = getFloat(buff, rd_pos);
        break;
      case 43:
        lifecycle.energy = getFloat(buff, rd_pos);
        break;
      case 44:
        lifecycle.sensor_ambient_light = getWord(buff, rd_pos);
        break;
      case 45:
        lifecycle.sensor_cct = getWord(buff, rd_pos);
        break;
      case 48:
        lifecycle.iaq_tempature_comp_off = getWord(buff, rd_pos);
        lifecycle.iaq_tempature_comp_on = getWord(buff, rd_pos + 2);
        break;
      default:
        break;
    }

    rd_pos += para_size;

  } while (rd_pos < data_size);


  if (lifecycle != {}) {
    emit('sample', { data: lifecycle, topic: "lifecycle" });
  }

  if (data != {}) {
    emit('sample', { data: data, topic: "default" });
  }
}