(function () {
    $(".change-image").click(function () {
        $("form[name='profileEditForm']").find("input[type='file']").click();
    });
})();