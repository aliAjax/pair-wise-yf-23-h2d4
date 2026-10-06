/** DMX 编址排布常量：单宇宙容量、排队宇宙上限、数据升级版本号 */
export const DMX_UNIVERSE_CAPACITY = 512;
/** 本场馆可用宇宙数；超出后仍放不下的灯具计入“还缺多少通道” */
export const DMX_MAX_UNIVERSES = 2;
export const DMX_ADDRESS_MIN = 1;
/** 旧数据（没有 channel_mode 字段）的数据版本，升级时按原 channel_count 回填 */
export const FIXTURE_SCHEMA_VERSION_LEGACY = 0;
export const FIXTURE_SCHEMA_VERSION = 2;
