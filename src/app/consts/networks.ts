export interface ISettings {
  specToken: string;
  specFarm: string;
  specPool: string;
  specLpToken: string;
  airdrop: string;
  gov: string;
  platform: string;
  warchest: string;
  wallet: string;
  terraSwapFactory: string;
  terraSwapRouter: string;
  astroportRouter: string;
  astroportFactory: string;
  valkyrieToken: string;
  astroToken: string;
  axlUsdcToken: string;
  axlUsdtToken: string;
  lunaXToken: string;
  tptToken: string;
  ampLunaToken: string;
  boneLunaToken: string;
  redToken: string;
  astroportGov: string;
  astroportGenerator: string;
  // MAINNET ONLY
  astroportAstroAxlUsdcFarm: string;
  astroportAstroAxlUsdcFarmCompoundProxy: string;
  astroportAxlUsdcAxlUsdtFarm: string;
  astroportAxlUsdcAxlUsdtFarmCompoundProxy: string;
  astroportAxlUsdcLunaFarm: string;
  astroportAxlUsdcLunaFarmCompoundProxy: string;
  astroportLunaXLunaFarm: string;
  astroportLunaXLunaFarmCompoundProxy: string;
  astroportVkrAxlUsdcFarm: string;
  astroportVkrAxlUsdcFarmCompoundProxy: string;
  astroportTptLunaFarm: string;
  astroportTptLunaFarmCompoundProxy: string;
  astroportAmpLunaLunaFarm: string;
  astroportAmpLunaLunaFarmCompoundProxy: string;
  astroportbLunaLunaFarm: string;
  astroportbLunaLunaFarmCompoundProxy: string;
  astroportRedLunaFarm: string,
  astroportRedLunaFarmCompoundProxy: string,
  // MAINNET ONLY
  // TESTNET ONLY
  astroportAstroLunaFarm: string;
  astroportAstroLunaFarmCompoundProxy: string;
  astroportVkrLunaFarm: string;
  astroportVkrLunaFarmCompoundProxy: string;
  astroportStblStbFarm: string;
  astroportStblStbFarmCompoundProxy: string;
  astroportStbLunaFarm: string;
  astroportStbLunaFarmCompoundProxy: string;
  stbToken: string;
  stblToken: string;
  // TESTNET ONLY
  lcd: string;
  fcd: string;
  querier: string;
  specAPI: string;
  chainID: string;
  finder: string;
  astroport_gql: string;
}

export const networks: Record<string, ISettings> = {
  mainnet: {
    specToken: '',
    specFarm: '',
    specPool: '',
    specLpToken: '',
    gov: '',
    airdrop: '',
    platform: '',
    warchest: '',
    wallet: '',
    terraSwapRouter: '',
    terraSwapFactory: '',
    astroportRouter: 'terra1j8hayvehh3yy02c2vtw5fdhz9f4drhtee8p5n5rguvg3nyd6m83qd2y90a',
    astroportFactory: 'terra14x9fr055x5hvr48hzy2t4q7kvjvfttsvxusa4xsdcy702mnzsvuqprer8r',
    valkyrieToken: 'terra1gy73st560m2j0esw5c5rjmr899hvtv4rhh4seeajt3clfhr4aupszjss4j',
    astroToken: 'terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26',
    axlUsdcToken: 'ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4',
    axlUsdtToken: 'ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF',
    lunaXToken: 'terra14xsm2wzvu7xaf567r693vgfkhmvfs08l68h4tjj5wjgyn5ky8e2qvzyanh',
    tptToken: 'terra13j2k5rfkg0qhk58vz63cze0uze4hwswlrfnm0fa4rnyggjyfrcnqcrs5z2',
    ampLunaToken: 'terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct',
    boneLunaToken: 'terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml',
    redToken: 'terra1xe8umegahlqphtpvjsuwfzfvyjfvag5h8rffsx6ezm0el4xzsf8s7uzezk',
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
    // MAINNET ONLY
    // TESTNET ONLY
    astroportAstroLunaFarm: '',
    astroportAstroLunaFarmCompoundProxy: '',
    astroportVkrLunaFarm: '',
    astroportVkrLunaFarmCompoundProxy: '',
    astroportStblStbFarm: '',
    astroportStblStbFarmCompoundProxy: '',
    astroportStbLunaFarm: '',
    astroportStbLunaFarmCompoundProxy: '',
    stbToken: '',
    stblToken: '',
    // TESTNET ONLY
    lcd: 'https://phoenix-lcd.terra.dev',
    fcd: 'https://phoenix-fcd.terra.dev',
    querier: '',
    specAPI: 'https://spec-api.azurefd.net/api',
    chainID: 'phoenix-1',
    finder: 'https://terrasco.pe',
    astroport_gql: 'astroport_mainnet'
  },
  testnet: {
    specToken: 'terra1jtu03gxpssmxcxydqs5dzsavdz8jum9a3un36tyuhyjhzamxf4gqlj2q48',
    specFarm: '',
    specPool: '',
    specLpToken: '',
    gov: '',
    airdrop: 'terra1suem5fge05egfzq8jc74zpej3aqx3d303eyprlx5r59qpkuz9ewq8qt0q2',
    platform: '',
    warchest: '',
    wallet: '',
    terraSwapRouter: '',
    terraSwapFactory: '',
    astroportRouter: 'terra1na348k6rvwxje9jj6ftpsapfeyaejxjeq6tuzdmzysps20l6z23smnlv64',
    astroportFactory: 'terra1z3y69xas85r7egusa0c7m5sam0yk97gsztqmh8f2cc6rr4s4anysudp7k0',
    valkyrieToken: 'terra1xqtstvlwcpz3kpcpw6vqh2grstw34wcezws5pawll95uuysu0hnqk6muds',
    astroToken: 'terra167dsqkh2alurx997wmycw9ydkyu54gyswe3ygmrs4lwume3vmwks8ruqnv',
    axlUsdcToken: '',
    axlUsdtToken: '',
    lunaXToken: '',
    tptToken: '',
    ampLunaToken: '',
    boneLunaToken: '',
    redToken: '',
    astroportGov: '',
    astroportGenerator: 'terra1pplp2s7u3h9cn3qddm7yfw7stajl8fqlu7tzr097697jx3ahtkqsnzvedu', // 'terra1gc4d4v82vjgkz0ag28lrmlxx3tf6sq69tmaujjpe7jwmnqakkx0qm28j2l',
    // MAINNET ONLY
    astroportAstroAxlUsdcFarm: '',
    astroportAstroAxlUsdcFarmCompoundProxy: '',
    astroportAxlUsdcAxlUsdtFarm: '',
    astroportAxlUsdcAxlUsdtFarmCompoundProxy: '',
    astroportAxlUsdcLunaFarm: '',
    astroportAxlUsdcLunaFarmCompoundProxy: '',
    astroportLunaXLunaFarm: '',
    astroportLunaXLunaFarmCompoundProxy: '',
    astroportVkrAxlUsdcFarm: '',
    astroportVkrAxlUsdcFarmCompoundProxy: '',
    astroportTptLunaFarm: '',
    astroportTptLunaFarmCompoundProxy: '',
    astroportAmpLunaLunaFarm: '', // pair: terra1cr8dg06sh343hh4xzn3gxd3ayetsjtet7q5gp4kfrewul2kql8sqvhaey4 lp: terra1cq22eugxwgp0x34cqfrxmd9jkyy43gas93yqjhmwrm7j0h5ecrqq5j7dgp
    astroportAmpLunaLunaFarmCompoundProxy: '',
    astroportbLunaLunaFarm: '',
    astroportbLunaLunaFarmCompoundProxy: '',
    astroportRedLunaFarm: '',
    astroportRedLunaFarmCompoundProxy: '',
    // MAINNET ONLY
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
    lcd: 'https://pisco-lcd.terra.dev',
    fcd: 'https://pisco-fcd.terra.dev',
    querier: '',
    specAPI: 'https://terra2-testapi.spec.finance/api',
    chainID: 'pisco-1',
    finder: 'https://finder.terra.money',
    astroport_gql: 'astroport_testnet'
  },
};
