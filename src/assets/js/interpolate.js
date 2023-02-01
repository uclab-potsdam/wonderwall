// import { ref, watchEffect, unref, watch, isRef } from "vue";
// import { interpolate } from "d3-interpolate";
// import isEqual from "lodash.isequal";

// export default function (value, duration = 500, label) {
//   // const props = ref(initial.props);
//   let start = null;
//   let interpolation = interpolate(null, value);
//   const interpolated = ref(null);
//   let oldvalue = ref(null);

//   console.log(label, isRef(value));

//   console.log("value", value);

//   watch(
//     () => value.value,
//     (newProps, oldProps) => {
//       console.log("WATCHED", label);
//       // if (isEqual(newProps, oldProps)) return;
//       console.log(interpolated.value, newProps);
//       interpolation = interpolate(interpolated.value, newProps);
//       start = null;
//       requestAnimationFrame(tick);
//     },
//     { deep: true }
//   );

//   // watchEffect(() => {
//   //   // interpolated.value = value;
//   //   console.log("SAW", label);
//   //   // // if (isEqual(newProps, oldProps)) return;
//   //   // interpolation =
//   //   console.log("old", "new", value);
//   //   // oldvalue.value = value;
//   //   // console.log("old", oldvalue.value, "new", value);
//   //   requestAnimationFrame((t) => tick(t, value.value));
//   // });

//   function tick(t) {
//     if (start === null) start = t;
//     const delta = Math.min((t - start) / duration, 1);
//     // console.log(interpolated.value.x, value.x, delta, label);
//     interpolated.value = interpolation(delta);
//     // console.log(interpolation(delta));
//     if (delta < 1) requestAnimationFrame(tick);
//   }

//   return interpolated;
// }

import { ref, isRef, watchEffect } from "vue";

export default function (url) {
  console.log(url);
  const data = ref(url);
  let start = null;
  const duration = 1000;

  function doFetch() {
    // reset state before fetching..
    console.log(url.value);
    start = null;
    requestAnimationFrame((t) => tick(t, url.value));
  }

  if (isRef(url)) {
    // setup reactive re-fetch if input URL is a ref
    console.log("ref");
    watchEffect(doFetch);
  } else {
    // otherwise, just fetch once
    console.log("no-ref");
    doFetch();
  }

  function tick(t) {
    if (start === null) start = t;
    const delta = Math.min((t - start) / duration, 1);
    // data.value = delta * 100 + url.value.x;
    data.value = url.value;
    if (delta < 1) requestAnimationFrame(tick);
  }

  return data;
}
