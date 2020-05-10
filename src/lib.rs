use wasm_bindgen::prelude::*;
use iota_signing;
use iota_conversion::Trinary;

#[wasm_bindgen]
pub fn new_address(seed: &str, index: usize, security: usize, checksum: bool) -> String {
    let key = iota_signing::key(&seed.trits(), index, security).unwrap();
    let digests = iota_signing::digests(&key).unwrap();
    let address_trits = iota_signing::address(&digests).unwrap();
    let mut address = address_trits.trytes().unwrap();
    if checksum {
        address = iota_signing::checksum::add_checksum(&address).unwrap();
    }
    address
}
