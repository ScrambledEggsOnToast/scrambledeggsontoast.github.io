// based on https://github.com/ghiculescu/jekyll-table-of-contents
(function($) {
  $.fn.toc = function(options) {

    var defaults = {
      noBackToTopLinks: false,
      title: '', //'<p class="toc-header">Contents</p>',
      listType: 'ol', // values: [ol|ul]
      showSpeed: 'slow'
    },
    settings = $.extend(defaults, options);
    
    var headers = $('h1, h2, h3, h4, h5, h6').filter(function() {
      // get all headers with an ID
      return this.id;
    }), output = $(this);
    if (!headers.length || headers.length < 3 || !output.length) {
      return;
    }
    var offsetArr = $.map(headers, function(el) { 
        return $(el).offset().top;
    });
    headers.splice(0,1);

    var get_level = function(ele) { return parseInt(ele.nodeName.replace("H", ""), 10); }
    var highest_level = headers.map(function(_, ele) { return get_level(ele); }).get().sort()[0];
    var return_to_top = '<a class="icon-arrow-up back-to-top">return to top</a>';
    
    var level = get_level(headers[0]),
      this_level,
      html = settings.title + " <"+settings.listType+">" + '<li class="toc-link"><div><a class="back-to-top">Top</a></div></li>';
    headers.each(function(_, header) {
      this_level = get_level(header);

      if (this_level === level) // same level as before; same indenting
        html += "<li class='toc-link'><div><a onClick=\"scrollTo('" + header.id + "')\">" + header.innerHTML + "</a></div>";
      else if (this_level < level) // higher level than before; end parent ol
        html += "</li></"+settings.listType+"></li><li class='toc-link'><div><a onClick=\"scrollTo('" + header.id + "')\">" + header.innerHTML + "</a></div>";
      else if (this_level > level) // lower level than before; expand the previous to contain a ol
        html += "<"+settings.listType+"><li class='toc-link'><div><a onClick=\"scrollTo('" + header.id + "')\">" + header.innerHTML + "</a></div>";
      level = this_level; // update for the next one
    });
    html += "</"+settings.listType+">";
    if (!settings.noBackToTopLinks) {
      $(document).on('click', '.back-to-top', function() {
        $('html,body').animate({scrollTop: 0},'slow');
        window.location.hash = '';
      });
    }

    if (0 !== settings.showSpeed) {
      output.hide().html(html).show(settings.showSpeed);
    } else {
      output.html(html);
    }



    var goToLinks = $("li.toc-link > div")


    var atHeader = function (y) {
        var yd = y - 0.2 * $(window).height();
        var pasts = $.map(offsetArr, function(offset) {
            return (offset < yd ? 1 : 0);
        });
        number = 0;
        for (i = 0; i < pasts.length; i++) {
            number += pasts[i];
        }
        return number;
    }
    
    var updateLinkClasses = function() {
        for (i = 0; i < goToLinks.length; i++) {
            $(goToLinks[i]).removeClass("toc-current-section");
        }
        $(goToLinks[atHeader($(window).scrollTop())]).addClass("toc-current-section");
    }

    $(window).on('load', updateLinkClasses);
    $(window).on('scroll', updateLinkClasses);

    var toFootnotes = $("a[rel='footnote']");
    var fromFootnotes = $("a[rel='reference']");

    /*$.each(toFootnotes, function(_,a) {
        var href = $(a).attr("href");
        $(a).removeAttr("href").css("cursor","pointer");
        $(a).attr('onClick','scrollTo("'+href.substring(1)+'")');
    });
    $.each(fromFootnotes, function(_,a) {
        var href = $(a).attr("href");
        $(a).removeAttr("href").css("cursor","pointer");
        $(a).attr('onClick','scrollTo("'+href.substring(1)+'")');
    });*/
  };
})(jQuery);
