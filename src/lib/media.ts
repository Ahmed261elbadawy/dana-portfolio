const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i;

export function isVideoUrl(url: string) {
  return VIDEO_EXT.test(url);
}

/**
 * Where a video's cover still lives. Posters are stored in the "images"
 * bucket under posters/<same base name as the video>.jpg, so the address
 * can be derived from the video URL with no extra database column.
 */
export function posterUrlFor(videoUrl: string) {
  return videoUrl
    .replace("/object/public/videos/", "/object/public/images/posters/")
    .replace(/\.[^./]+(\?.*)?$/, ".jpg");
}
