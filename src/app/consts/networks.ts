import {
  CONFIG,
  INJECTIVE_MAINNET_CHAINID,
  INJECTIVE_TESTNET_CHAINID,
  NEUTRON_MAINNET_CHAINID,
  NEUTRON_TESTNET_CHAINID,
  TERRA2_MAINNET_CHAINID,
  TERRA2_TESTNET_CHAINID,
  getCurrentChainBrand,
  SEI_TESTNET_CHAINID,
  INJECTIVE_TESTNET_REST,
  NEUTRON_MAINNET_REST,
  NEUTRON_TESTNET_REST,
  SEI_TESTNET_REST,
  SEI_TESTNET_RPC,
  TERRA2_MAINNET_REST,
  TERRA2_TESTNET_REST,
} from './config';
import { ASTRO_NEUTRON_MAINNET, ASTRO_NEUTRON_TESTNET, ASTRO_TERRA2_MAINNET, AXLUSDC_TERRA2_MAINNET, AXLUSDT_TERRA2_MAINNET, STLUNA_TERRA2_MAINNET, USDC_NEUTRON_MAINNET } from './denom';

export interface ISettings {
  specToken: string;
  airdrop: string;
  astroportRouter: string;
  astroportFactory: string;
  valkyrieToken?: string;
  astroToken: string;
  axlUsdcToken?: string;
  axlUsdtToken?: string;
  lunaXToken?: string;
  tptToken?: string;
  ampLunaToken?: string;
  boneLunaToken?: string;
  redToken?: string;
  sayveToken?: string;
  stLUNAToken?: string;
  roarToken?: string;
  capaToken?: string;
  solidToken?: string;
  xAstroToken?: string;
  astroportGov?: string;
  astroportGenerator?: string;
  // MAINNET ONLY
  astroportAstroAxlUsdcFarm?: string;
  astroportAstroAxlUsdcFarmCompoundProxy?: string;
  astroportAxlUsdcAxlUsdtFarm?: string;
  astroportAxlUsdcAxlUsdtFarmCompoundProxy?: string;
  astroportAxlUsdcLunaFarm?: string;
  astroportAxlUsdcLunaFarmCompoundProxy?: string;
  astroportLunaXLunaFarm?: string;
  astroportLunaXLunaFarmCompoundProxy?: string;
  astroportVkrAxlUsdcFarm?: string;
  astroportVkrAxlUsdcFarmCompoundProxy?: string;
  astroportTptLunaFarm?: string;
  astroportTptLunaFarmCompoundProxy?: string;
  astroportAmpLunaLunaFarm?: string;
  astroportAmpLunaLunaFarmCompoundProxy?: string;
  astroportbLunaLunaFarm?: string;
  astroportbLunaLunaFarmCompoundProxy?: string;
  astroportRedLunaFarm?: string;
  astroportRedLunaFarmCompoundProxy?: string;
  astroportSayveLunaFarm?: string;
  astroportSayveLunaFarmCompoundProxy?: string;
  astroportLunaStLunaFarm?: string;
  astroportLunaStLunaFarmCompoundProxy?: string;
  astroportRoarLunaFarm?: string;
  astroportRoarLunaFarmCompoundProxy?: string;
  astroportCapaLunaFarm?: string;
  astroportCapaLunaFarmCompoundProxy?: string;
  astroportSolidAxlUsdcFarm?: string;
  astroportSolidAxlUsdcCompoundProxy?: string;
  astroportCapaSolidFarm?: string;
  astroportCapaSolidCompoundProxy?: string;
  // MAINNET ONLY
  // TESTNET ONLY
  astroportAstroLunaFarm?: string;
  astroportAstroLunaFarmCompoundProxy?: string;
  astroportVkrLunaFarm?: string;
  astroportVkrLunaFarmCompoundProxy?: string;
  astroportStblStbFarm?: string;
  astroportStblStbFarmCompoundProxy?: string;
  astroportStbLunaFarm?: string;
  astroportStbLunaFarmCompoundProxy?: string;
  // INJECTIVE
  astroportAstroInjFarm?: string;
  astroportAstroInjFarmCompoundProxy?: string;
  // INJECTIVE
  // NEUTRON
  astroportAstroUsdcFarm?: string;
  astroportAstroUsdcFarmCompoundProxy?: string;
  astroportNtrnUsdcFarm?: string;
  astroportNtrnUsdcFarmCompoundProxy?: string;
  // NEUTRON
  injToken?: string;
  stbToken?: string;
  stblToken?: string;
  usdcToken: string;
  // TESTNET ONLY
  lcd: string;
  fcd: string;
  querier: string;
  specAPI: string;
  chainID: string;
  finder: string;
  astroport_gql: string;
}

export const networks: Record<string, ISettings> = getCurrentChainBrand() === 'Terra'
  ? {
    mainnet: {
      specToken: '',
      airdrop: '',
      astroportRouter: 'terra1j8hayvehh3yy02c2vtw5fdhz9f4drhtee8p5n5rguvg3nyd6m83qd2y90a',
      astroportFactory: 'terra14x9fr055x5hvr48hzy2t4q7kvjvfttsvxusa4xsdcy702mnzsvuqprer8r',
      valkyrieToken: 'terra1gy73st560m2j0esw5c5rjmr899hvtv4rhh4seeajt3clfhr4aupszjss4j',
      astroToken: 'terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26',
      usdcToken: AXLUSDC_TERRA2_MAINNET,
      axlUsdcToken: AXLUSDC_TERRA2_MAINNET,
      axlUsdtToken: AXLUSDT_TERRA2_MAINNET,
      lunaXToken: 'terra14xsm2wzvu7xaf567r693vgfkhmvfs08l68h4tjj5wjgyn5ky8e2qvzyanh',
      tptToken: 'terra13j2k5rfkg0qhk58vz63cze0uze4hwswlrfnm0fa4rnyggjyfrcnqcrs5z2',
      ampLunaToken: 'terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct',
      boneLunaToken: 'terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml',
      redToken: 'terra1xe8umegahlqphtpvjsuwfzfvyjfvag5h8rffsx6ezm0el4xzsf8s7uzezk',
      sayveToken: 'terra1xp9hrhthzddnl7j5du83gqqr4wmdjm5t0guzg9jp6jwrtpukwfjsjgy4f3',
      stLUNAToken: STLUNA_TERRA2_MAINNET,
      roarToken: 'terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv',
      capaToken: 'terra1t4p3u8khpd7f8qzurwyafxt648dya6mp6vur3vaapswt6m24gkuqrfdhar',
      solidToken: 'terra10aa3zdkrc7jwuf8ekl3zq7e7m42vmzqehcmu74e4egc7xkm5kr2s0muyst',
      xAstroToken: 'terra1x62mjnme4y0rdnag3r8rfgjuutsqlkkyuh4ndgex0wl3wue25uksau39q8',
      astroportGov: '',
      astroportGenerator: 'terra1vf9ceekuxx8kycm7yv6hs96hgwsmrzt4la6s84skrgvfu7t09huqqdg09d', // 'terra1ksvlfex49desf4c452j6dewdjs6c48nafemetuwjyj6yexd7x3wqvwa7j9',
      // MAINNET ONLY
      astroportAstroAxlUsdcFarm: 'terra144mkz6p3mmnuqaenu73pg4jwayr3m28xzhaxedlfwfnyke45w6yqvf9ed6', // pair: terra1w579ysjvpx7xxhckxewk8sykxz70gm48wpcuruenl29rhe6p6raslhj0m6, lp: terra16esjk7qqlgh8w7p2a58yxhgkfk4ykv72p7ha056zul58adzjm6msvc674t
      astroportAstroAxlUsdcFarmCompoundProxy: 'terra1jjajqlvjycmze540pzqq2wekqtt6tkn3d9t3muwfelqz43ewwdkskqn0tx',
      astroportAxlUsdcAxlUsdtFarm: 'terra1ufpsjrvj5fkvdedx2ttslnrc2wxvrftf4zcsvu778cufvlh4m9dsmgcf6f', // pair: terra1ygn5h8v8rm0v8y57j3mtu3mjr2ywu9utj6jch6e0ys2fc2pkyddqekwrew, lp: terra1khsxwfnzuxqcyza2sraxf2ngkr3dwy9f7rm0uts0xpkeshs96ccsqtu6nv
      astroportAxlUsdcAxlUsdtFarmCompoundProxy: 'terra155c9lt7vw7dut2y7ltdhgw4g6r4x6spetple795ecf39sqps6dtqy4zddg',
      astroportAxlUsdcLunaFarm: 'terra1erm54gtdtfqv2s4c7ple3kmret7eecuj02nk5w8h08jjnenjffzsynsp0u', // pair: terra1fd68ah02gr2y8ze7tm9te7m70zlmc7vjyyhs6xlhsdmqqcjud4dql4wpxr, lp: terra1ckmsqdhlky9jxcmtyj64crgzjxad9pvsd58k8zsxsnv4vzvwdt7qke04hl
      astroportAxlUsdcLunaFarmCompoundProxy: 'terra1zd70awvqdxgzu9zymkkg2kng9wq2s7vxug33ydcmj7ve6st6du0ql2e0zn',
      astroportLunaXLunaFarm: 'terra1qczgczguzmxpsqfwlcaqm5hpy3jrkgrkkkcdxhd4uf28t8l8j6qsgtd863', // pair : terra1mpj7j25fw5a0q5vfasvsvdp6xytaqxh006lh6f5zpwxvadem9hwsy6m508, lp: terra1kggfd6z0ad2k9q8v24f7ftxyqush8fp9xku9nyrjcs2wv0e4kypszfrfd0
      astroportLunaXLunaFarmCompoundProxy: 'terra190rnel2k0nmt9qmqh57rfnaxf9x5a24e2xeg3tn94vdg9mwf2pws55jmw6',
      astroportVkrAxlUsdcFarm: 'terra1ha4yvzqnq4mpu205wcd430m6m7wjklpquwn87dq89g9zersuvryses7rua', // pair : terra1alzkrc6hkvs8g5a064cukfxnv0jj4l3l8vhgfypfxvysk78v6dgqsymgmv, lp :terra18mcmlf4v23ehukkh7qxgpf5tznzg6893fxmf9ffmdt9phgf365zqvmlug6
      astroportVkrAxlUsdcFarmCompoundProxy: 'terra1pkuf6adp9gjmqvjlwkgvjrn3w09gfe7gukdevr5lqnltvna6c4rqa3rpf6',
      astroportTptLunaFarm: 'terra1udwqynsmrme00ksrakkyerrfjdkw9p05557yrrw6ca6x94uuj2zs0vpqt2', // pair: terra15l5pqlp8q5d4z8tvermadvp429d8pfctg4j802t8edzkf8aavp7q59t7er lp: terra1ces6k6jp7qzkjpwsl6xg4f7zfwre0u23cglg69hhj3g20fhygtpsu24dsy
      astroportTptLunaFarmCompoundProxy: 'terra18t4wj99s23yd34x8vmlttdwlqjhae7xvyzwfaryyem6s2yzvnmrsp87493',
      astroportAmpLunaLunaFarm: 'terra1gxqzjk4pkyzpnxnrz7h486vntvv4lmaukcs24v9gcsmcm4tyre7qytcm5e', // pair: terra1cr8dg06sh343hh4xzn3gxd3ayetsjtet7q5gp4kfrewul2kql8sqvhaey4 lp: terra1cq22eugxwgp0x34cqfrxmd9jkyy43gas93yqjhmwrm7j0h5ecrqq5j7dgp
      astroportAmpLunaLunaFarmCompoundProxy: 'terra125yu3wj3qkc2hrn46h54nhufsekd38m7fvx9c3zdrlt6l6dhekksgv4qdn',
      astroportbLunaLunaFarm: 'terra1w6l7kjc6wu7an37wnnehcfc3tpksw9tde9u67743ew0caly0hdasv0ws79', // pair: terra1h32epkd72x7st0wk49z35qlpsxf26pw4ydacs8acq6uka7hgshmq7z7vl9 lp: terra1h3z2zv6aw94fx5263dy6tgz6699kxmewlx3vrcu4jjrudg6xmtyqk6vt0u
      astroportbLunaLunaFarmCompoundProxy: 'terra1dj5a533qyxgcvrhum9zusplnnpv6a6dal7xd67gp2qprqwzew4dqx4dhch',
      astroportRedLunaFarm: 'terra1j9ggd8wf73ggsfet99wnjvn06f3l9w9lsf50uac43h6vclysfc9sp0nyfh', // pair: terra1zhq0rqermczklmw89ranmgz28zthsthw6u35umgvpykfwzlwtgcsylpqqf lp: terra1ua7uk7xvx89dg8tnr8k8smk5vermlaer50zsglmpx8plttaxvvtsem5fgy
      astroportRedLunaFarmCompoundProxy: 'terra1rzxfvde2dhe3l44r3llugqpuxl4njps0xk2ss96vfmlw3nmhusdqt8zphj',
      astroportSayveLunaFarm: 'terra1v9luz2r9u8mzd4w8ew5dm4cczk8kcxun4jry464j48jsl2fus2qss73ld4', // pair: terra1nckl6ex6239tv4kjzv03ecmuxwakjm8uj8cy6p850vmlmejfmj9sy094yr lp: terra1zqthrqndchxp5ye443zdulhhh2938uak78q4ztthfrnkfltpgrpsu3c5xd
      astroportSayveLunaFarmCompoundProxy: 'terra1cgya885wdlqvu2ad0fengce39lyvq02ccczh7w7hkt7yylll2klsw62urq',
      astroportLunaStLunaFarm: 'terra1n8lx9uhysjfxsc9cqanydrkqlm3wrenew8kc0vqzjr6gw0u92teqrmvxcv', // pair: terra1re0yj0j6e9v2szg7kp02ut6u8jjea586t6pnpq6628wl36fphtpqwt6l7p lp : terra14n22zd24nath0tf8fwn468nz7753rjuks67ppddrcqwq37x2xsxsddqxqc
      astroportLunaStLunaFarmCompoundProxy: 'terra18v87nv8nhxtmynetmtg228lee2cgx7dk828szuglkjnvwhr6ye0qaz48w5',
      astroportRoarLunaFarm: 'terra1fz4x56u96fkgzvtdxaq2969qlmfk4wnwq0fqhlrklpqc629ah9qs4h8v50', // pair: terra1c7g9pmz2xxe66g8ujpe5tlmj3pawjp290f57cl43j6vswkdtrvwqkgme9q, lp: terra1qmr5wagmeej33hsnqdmqyvkq6rg3sfkvflmu6gd6drhtjfpx4y5sew88s4
      astroportRoarLunaFarmCompoundProxy: 'terra14l4nwrfcdgjd2dtucd8f66p8w0fanxvus7twuuupq96cmw82w4usw2wjc3',
      astroportCapaLunaFarm: 'terra1z8q3gq26fnvdfaj0yrf04unmlkt2uge2d0j9ve25zpyfj9u2r9jsxw8msm', // pair: terra1a0druggg6c7u88ps37q03jxuexznjmq0xnhg8c8d7xnfaelq4t0qype5j3, lp: terra1eae46l4etn6j9zh3rrzalzdkw4j7wwf974v7ep882utkvtvy6h5qcjms7l
      astroportCapaLunaFarmCompoundProxy: 'terra1utu92kjw2gze05wgl0gvac9y69u2w0d2utkmn9zgkfu8kaq6wf4suffr5a',
      astroportSolidAxlUsdcFarm: 'terra1fe83u43uz65smen45vwvj7w5838nerehv2la6utvhsr9c87ykr0qsvshqu', // pair: terra1jd04eztujfgt4z0uyw7lkm0gujs0gpxs6pd5gv8ltt5xccmq3v8sppm7wg, lp: terra1rdjm94n3r4uvhfh23s98tfcgzedkuvjwvkcjqa503amef9afya7sddv098
      astroportSolidAxlUsdcCompoundProxy: 'terra12957ajdm5exxv5lz45vydr4nf2dwyjmzrgnrkhe6eyym6r99amuqppcp4t',
      astroportCapaSolidFarm: 'terra1rasvh4nv8znpjg6jtkzxjskfynze98h9zv4qn8ese7tkwf0zjaaq0z60t8', // pair: terra1g6z93vtttdrwfdtj06ha2nwc6qdxsfy8appge5l5g7wenfzg5mjq8s3r9n, lp: terra1d4ltsnke3grgw90dad5qf3jle7l0t9z8zsshqzp6g8v3j0ecvpksevz5z7
      astroportCapaSolidCompoundProxy: 'terra1x6m9v42s9drr7dcpatuy850w7t9secpyx5v97j3x6mxp2fn0l0uq68v20u',
      // MAINNET ONLY
      lcd: TERRA2_MAINNET_REST,
      fcd: 'https://phoenix-fcd.terra.dev',
      querier: '',
      specAPI: 'https://spec-api-eeh8efcmd2b0fffh.z01.azurefd.net/api',
      chainID: TERRA2_MAINNET_CHAINID,
      finder: 'https://terrasco.pe',
      astroport_gql: 'astroport_multichain'
    },
    testnet: {
      specToken: 'terra1jtu03gxpssmxcxydqs5dzsavdz8jum9a3un36tyuhyjhzamxf4gqlj2q48',
      airdrop: 'terra1suem5fge05egfzq8jc74zpej3aqx3d303eyprlx5r59qpkuz9ewq8qt0q2',
      astroportRouter: 'terra1na348k6rvwxje9jj6ftpsapfeyaejxjeq6tuzdmzysps20l6z23smnlv64',
      astroportFactory: 'terra1z3y69xas85r7egusa0c7m5sam0yk97gsztqmh8f2cc6rr4s4anysudp7k0',
      valkyrieToken: 'terra1xqtstvlwcpz3kpcpw6vqh2grstw34wcezws5pawll95uuysu0hnqk6muds',
      astroToken: 'terra167dsqkh2alurx997wmycw9ydkyu54gyswe3ygmrs4lwume3vmwks8ruqnv',
      usdcToken: '',
      astroportGov: '',
      astroportGenerator: 'terra1pplp2s7u3h9cn3qddm7yfw7stajl8fqlu7tzr097697jx3ahtkqsnzvedu', // 'terra1gc4d4v82vjgkz0ag28lrmlxx3tf6sq69tmaujjpe7jwmnqakkx0qm28j2l',
      // TESTNET ONLY
      astroportAstroLunaFarm: 'terra1e9xfd3zxnra963meea5e7vvdm89dwd2tgvg4cq96q33c2s204cuqgl3wxq',
      astroportAstroLunaFarmCompoundProxy: 'terra1dw2yae6dz0x34gyawhn4v5sgt6flq99raemhjv56360anv40m59s4z59vl',
      astroportVkrLunaFarm: 'terra1e8h9cuylm98rl374hh6tdu363g6jmg5k678tm0vwdtt3xc8wy78s2u4eat',
      astroportVkrLunaFarmCompoundProxy: 'terra16v2jfrrnh3472gzr5kdp6n87ckmmtm2nep5fcd96aykljvhyjatssk7dxf',
      astroportStblStbFarm: 'terra1wuzwgf7e8yqdjmtzq9dj43nqg6fpe3n3wu3lzw9fedxdsf42xdhs25c5zq',
      astroportStblStbFarmCompoundProxy: 'terra1jmkkqdtw07zrantq6s0u0yqlwywrj8p8ewfkfa2yps3f5xg56c4qmwu54c',
      astroportStbLunaFarm: 'terra1k7tq3pzcus65dp4e2sgzw9lzretk7p23ssr6tjwsunhju6lxsl5qs24mn2',
      astroportStbLunaFarmCompoundProxy: 'terra1yk3mwaj5ck8s2kv4xnaflu9a8enjxxgxzsna7tvjpm7x65ndj9hsse8av3',
      stbToken: 'terra1s50rr0vz05xmmkz5wnc2kqkjq5ldwjrdv4sqzf983pzfxuj7jgsq4ehcu2', // terra10kypagsdkrc769dnxs0th3wk87t84vu6gvrfzfg9ee93rfanu32qqfluee stb-luna pair
      stblToken: 'terra1dw6s040xnv2sp8lfgeu8jjtwp0jtws6ahtmw2a3h9j9r0eddy47qesq8j2', // terra15207c4rlvz49sr692flm4v4q87c8fhszk7j74avxuzv5kefaywvquthwjq stbl-stb pair
      // TESTNET ONLY
      lcd: TERRA2_TESTNET_REST,
      fcd: 'https://pisco-fcd.terra.dev',
      querier: '',
      specAPI: 'https://terra2-testapi.spec.finance/api',
      chainID: TERRA2_TESTNET_CHAINID,
      finder: 'https://finder.terra.money',
      astroport_gql: 'astroport_multichain'
    },
  }
  : getCurrentChainBrand() === 'Injective' ?
  {
    mainnet: {
      specToken: '',
      airdrop: '',
      astroToken: '',
      astroportRouter: '',
      astroportFactory: '',
      astroportGenerator: '',
      lcd: 'https://lcd.injective.network',
      fcd: '',
      querier: '',
      specAPI: 'https://terra2-testapi.spec.finance/api',
      chainID: INJECTIVE_MAINNET_CHAINID,
      finder: 'https://explorer.injective.network',
      astroport_gql: 'astroport_multichain',
      usdcToken: '',
    },
    testnet: {
      specToken: '',
      airdrop: '',
      astroportRouter: '',
      astroportFactory: 'inj1c4e2787cwawlqslph0yzn62wq4xpzzq9y9kjwj',
      astroportGenerator: 'inj17fmw9nc6hkzafujnnjn29c3xa9r927j9tk02mw',
      lcd: INJECTIVE_TESTNET_REST,
      fcd: '',
      querier: '',
      specAPI: 'https://terra2-testapi.spec.finance/api',
      chainID: INJECTIVE_TESTNET_CHAINID,
      finder: 'https://testnet.explorer.injective.network',
      astroport_gql: 'astroport_multichain',
      astroportAstroInjFarm: 'inj1pdf6w4qxf0c9zneju6l92zswpfx772ynhd4rfv',
      astroportAstroInjFarmCompoundProxy: 'inj1r5h0gwyj8r264zmelk4vnjmt0qyfmhjlzfq204',
      astroToken: ASTRO_TERRA2_MAINNET,
      injToken: 'inj',
      usdcToken: 'factory/inj17vytdwqczqz72j65saukplrktd4gyfme5agf6c/usdc',
    }
  }
 : getCurrentChainBrand() === 'Neutron' ?
  {
      mainnet: {
        specToken: '',
        airdrop: '',
        usdcToken: USDC_NEUTRON_MAINNET,
        astroToken: ASTRO_NEUTRON_MAINNET,
        astroportRouter: 'neutron1eeyntmsq448c68ez06jsy6h2mtjke5tpuplnwtjfwcdznqmw72kswnlmm0',
        astroportFactory: 'neutron1hptk0k5kng7hjy35vmh009qd5m6l33609nypgf2yc6nqnewduqasxplt4e',
        astroportGenerator: 'neutron1zlfq2a445zh9xhjervx8c5xhrwsyss6y20hw73mvp7nnefrgptfqg2vx55',
        astroportAstroUsdcFarm: 'neutron167rl44fxyfr2gge2xax6fyknau02yx5fuanymw08kh39lztnprqsnsez50',
        astroportAstroUsdcFarmCompoundProxy: 'neutron1lt0se040ft6qn3unznzjwytxjp8920t053dctzx6n4wk6zp7t68qp8r6z6',
        astroportNtrnUsdcFarm: 'neutron1085xc4thjxpwn7ls9q3du98xmqfqaq8t7wctlua893xrqenncw2ql22ntp',
        astroportNtrnUsdcFarmCompoundProxy: 'neutron10008ey4hpn4px7d4jca9evlwh8kft5newm82pnga3aee27fngrysjmvyf0',
        lcd: NEUTRON_MAINNET_REST, // TODO
        fcd: '',
        querier: '',
        specAPI: '',
        chainID: NEUTRON_MAINNET_CHAINID,
        finder: 'https://www.mintscan.io/neutron/', // TODO override format https://www.mintscan.io/neutron/account/*
        astroport_gql: 'astroport_multichain',
      },
      testnet: {
        specToken: '',
        airdrop: '',
        usdcToken: 'neutron1h6pztc3fn7h22jm60xx90tk7hln7xg8x0nazef58gqv0n4uw9vqq9khy43',
        astroToken: ASTRO_NEUTRON_TESTNET,
        astroportRouter: 'neutron1eeyntmsq448c68ez06jsy6h2mtjke5tpuplnwtjfwcdznqmw72kswnlmm0',
        astroportFactory: 'neutron1jj0scx400pswhpjes589aujlqagxgcztw04srynmhf0f6zplzn2qqmhwj7',
        astroportGenerator: 'neutron1m2zesqtswl5fe9mwn4m9zkze6e9287uf2gj27xyf9s9guglsc29sd280tt',
        astroportAstroUsdcFarm: 'neutron1hr27fda8eu0dqzgd94ve85nygw8q9yqj433vxam6rkh8z9gp78dsn4w02s',
        astroportAstroUsdcFarmCompoundProxy: 'neutron1q29nvq4wqs7fcugyrf0384s03ple2gafjshg50kwh03luqh0e62qx0xc6l',
        lcd: NEUTRON_TESTNET_REST,
        fcd: '',
        querier: '',
        specAPI: '',
        chainID: NEUTRON_TESTNET_CHAINID,
        finder: 'https://explorer.rs-testnet.polypore.xyz',
        astroport_gql: 'astroport_multichain',
      }
    }
    : // Sei
    {
  mainnet: {
    specToken: '',
    airdrop: '',
    usdcToken: '',
    astroToken: '',
    astroportRouter: '',
    astroportFactory: '',
    astroportGenerator: '',
    lcd: '',
    fcd: '',
    querier: '',
    specAPI: '',
    chainID: '',
    finder: '',
    astroport_gql: 'astroport_multichain',
  },
  testnet: {
    specToken: '',
    airdrop: '',
    usdcToken: '',
    astroToken: '',
    astroportRouter: '',
    astroportFactory: '',
    astroportGenerator: '',
    lcd: SEI_TESTNET_REST,
    fcd: '',
    querier: '',
    specAPI: '',
    chainID: SEI_TESTNET_CHAINID,
    finder: '',
    astroport_gql: 'astroport_multichain',
  }
};
