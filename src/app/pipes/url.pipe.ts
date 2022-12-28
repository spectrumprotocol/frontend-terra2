import {Pipe, PipeTransform} from '@angular/core';
import {TerrajsService} from '../services/terrajs.service';

@Pipe({
  name: 'url'
})
export class UrlPipe implements PipeTransform {

  constructor(
    private terrajs: TerrajsService,
  ) {
  }

  transform(symbolOrContract: string, type: string, dex?: string) {
    if (!symbolOrContract) {
      return symbolOrContract;
    }
    switch (type) {
      case 'icon':
        switch (symbolOrContract) {
          case 'Spectrum':
            return '/assets/SPEC.png';
          case 'SPEC':
            return '/assets/SPEC.png';
          case 'Valkyrie':
            return 'https://app.valkyrieprotocol.com/icon_vkr.png';
          case 'VKR':
            return 'https://app.valkyrieprotocol.com/icon_vkr.png';
          case 'LUNA':
            return `/assets/luna.png`;
          case 'ASTRO':
            return `https://astroport.fi/astro_logo.png`;
          case 'STB':
            return `https://app.astroport.fi/tokens/dune.svg`;
          case 'STBL':
            return `https://app.astroport.fi/tokens/dune.svg`;
          case 'axlUSDC':
            return `/assets/usdc.svg`;
          case 'axlUSDT':
            return `/assets/usdt.svg`;
          case 'LunaX':
            return `/assets/lunax.png`;
          case 'Astroport':
            return `https://astroport.fi/astro_logo.png`;
          case 'Stader':
            return `/assets/lunax.png`;
          case 'TPT':
            return `/assets/tpt.svg`;
          case 'Terrapoker':
            return `/assets/tpt.svg`;
          case 'ampLUNA':
            return `/assets/ampLuna.png`;
          case 'Eris':
            return `/assets/eris.png`;
          case 'Backbone':
            return `/assets/backbone.png`;
          case 'bLUNA':
            return `/assets/boneluna.png`;
          case 'Redacted':
              return `/assets/red.svg`;
          case 'RED':
              return `/assets/red.svg`;
          default:
            return null;
        }
      case 'trade':
        switch (symbolOrContract) {
          default: {
            if (dex === 'Astroport') {
              return `https://app.astroport.fi/swap?from=${this.terrajs.settings.axlUsdcToken}&to=${symbolOrContract}`;
            } else {
              return 'https://app.terraswap.io/#Swap';
            }
          }
        }
      case 'provideLP':
        switch (symbolOrContract) {
          default: {
            if (dex === 'Astroport') {
              return 'https://app.astroport.fi/pools/';
            } else {
              return 'https://app.terraswap.io/#Provide';
            }
          }
        }
    }
  }

}
