# jquery.leadvids

## What does Leadvids do?

Leadvids is a simple jQuery plugin that adds the ability to display a JavaScript rendered form to a user at a specific moment during video streaming. This feature is available in platforms such as Wistia, Brightcove, and Vimeo - but generally requires a specific plan to be purchased.

## Dependencies

- jQuery


### An Important Note On HTML Structure

Because this plugin relies on placing an overlay on top of the video player - it is highly recommended that you implement a wrapper that forces a specific aspect ratio. Leadvids does not add a wrapper around the embedded players. The reasoning for this is because the jQuery `.wrap()` function causes the iframe element to reload - which is bad for multiple reasons (namely performance). Therefore - use something like the Responsive Embed component in Bootstrap 3 (https://getbootstrap.com/docs/3.3/components/#responsive-embed).

Failure to do this will result in strange and unpredictable behavior - you have been warned.

## Example

```
<html>
<head>
</head>
<body>
<iframe src="https://player.vimeo.com/video/xxxxxx" 
        width="640" 
        height="360" 
        frameborder="0" 
        allowfullscreen 
        class="myLeadvid"></iframe>
      
<!-- jQuery -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
<!-- jquery.leadvids.js -->
<script src="/path/to/jquery.leadvids.js"></script>
<!-- HubSpot Forms Library -->
<script src="//js.hsforms.net/forms/v2.js"></script>

<script>
// Globally update the form provider defaults
$.fn.leadvids.defaults = {
  provider: {
    type: 'hubspot',
    id: 2660377
  }
};

// Initialize a leadvids collection
$('.myLeadvid').leadvids({
  formId: '6f7e41d0-60e1-42e1-a2cd-7f0fcf07d734',
  freepass: true,
  freepassButtonClass: 'btn btn-link',
  freepassLimit: 1,
  submitButtonClass: 'btn btn-block btn-primary',
  threshold: 10,
  thresholdUnit: '%'
});
</script>
</body>
</html>
```

## What video providers are supported?

At this moment, Leadvids supports the following video providers:

- Vimeo

Additional providers will be added in the future. 

## What form providers are supported?

Leadvids supports the following embedded form providers:

- HubSpot
- Marketo

## Browser & Device Support

**Mobile**

In an effort to provide the best user experience, Leadvids will not function when the viewport width is less than 768px. This is for 2 reasons:

1. Certain mobile browsers (such as iOS) automatically play the video in fullscreen mode.
2. The players would be too small to provide a usable interface.

**Tablet & Desktop**

- IE 11+ 

Support may vary depending on capabilities of each video and form provider.

See the links below for each providers API reference:

- Vimeo - https://github.com/vimeo/player.js#browser-support
