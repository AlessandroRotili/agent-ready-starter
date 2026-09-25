// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AmbientVideo } from '@/components/media/ambient-video';
vi.mock('next/image',()=>({default:(props:React.ImgHTMLAttributes<HTMLImageElement>)=>React.createElement('img',props)}));
let intersection:IntersectionObserverCallback;
let reduced=false;
beforeEach(()=>{
  reduced=false;
  vi.stubGlobal('matchMedia',()=>({get matches(){return reduced;},addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  vi.stubGlobal('IntersectionObserver',class { constructor(callback:IntersectionObserverCallback){intersection=callback;}observe(){}disconnect(){} });
  vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
function visible(value:boolean){act(()=>intersection([{isIntersecting:value} as IntersectionObserverEntry],{} as IntersectionObserver));}
it('never overlays a poster on a video and stops offscreen playback',async()=>{
  const {container}=render(<AmbientVideo src="/sample.mp4" poster="/poster.webp" width={1600} height={900}/>);
  expect(container.querySelector('video')).toBeNull();expect(container.querySelector('img')).not.toBeNull();
  visible(true);expect(container.querySelector('video')).not.toBeNull();expect(container.querySelector('img')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Pausa animazione'}));expect(container.querySelector('video')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Riprendi animazione'}));expect(container.querySelector('video')).not.toBeNull();
  visible(false);expect(container.querySelector('video')).toBeNull();expect(container.querySelector('img')).not.toBeNull();
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
});
it('does not create a video when reduced motion is requested',()=>{
  reduced=true;const {container}=render(<AmbientVideo src="/sample.mp4" poster="/poster.webp" width={1600} height={900}/>);
  visible(true);expect(container.querySelector('video')).toBeNull();expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
});
it('returns to the poster when autoplay is refused',async()=>{
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error('Autoplay blocked'));
  const {container}=render(<AmbientVideo src="/sample.mp4" poster="/poster.webp" width={1600} height={900}/>);
  visible(true);await waitFor(()=>expect(container.querySelector('video')).toBeNull());expect(container.querySelector('img')).not.toBeNull();
});
