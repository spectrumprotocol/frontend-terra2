npx json2ts -i ../astroport/astroport-core/contracts/factory/schema/ -o ./src/app/services/api/astroport_factory
npx json2ts -i ../astroport/astroport-core/contracts/pair/schema/ -o ./src/app/services/api/astroport_pair
npx json2ts -i ../astroport/astroport-core/contracts/pair_stable/schema/ -o ./src/app/services/api/astroport_pair_stable
npx json2ts -i ../astroport/astroport-core/contracts/router/schema/ -o ./src/app/services/api/astroport_router
npx json2ts -i ../astroport/astroport-core/contracts/token/schema/ -o ./src/app/services/api/token
npx json2ts -i ../astroport/astroport-core/contracts/tokenomics/generator/schema/ -o ./src/app/services/api/astroport_generator

npx json2ts -i ../spectrum-core/contracts/astroport_farm/schema -o ./src/app/services/api/spectrum_astroport_farm
npx json2ts -i ../spectrum-core/contracts/compound_proxy/schema -o ./src/app/services/api/spectrum_compound_proxy
npx json2ts -i ../contracts-private/contracts/spectrum_farmv2/schema -o ./src/app/services/api/spectrum_spec_farm



npx json2ts -i ../spectrum-core/contracts/fees_collector/schema -o ./common/services/api/spectrum_fees_collector
