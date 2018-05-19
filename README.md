[Symbiose 1.0 beta 5](http://symbiose.fr.cr/)
==============================================

[![Build Status](https://travis-ci.org/symbiose/symbiose.svg?branch=master)](https://travis-ci.org/symbiose/symbiose)

Это (beta) версия не стабильна. 

Основные возможности
------------

* Приложения:
 * Calculator (важно!)
 * Редактор кода Brackets
 * Основной текстовый редактор ([gedit](https://en.wikipedia.org/wiki/Gedit))
 * File manager with copy-paste, drag'n'drop, file sharing, searching...
 * Google Docs to display and edit your documents
 * [Chat app](https://github.com/odinvolk/symbiose/wiki/Empathy) which supports XMPP (Google, Facebook, with multiple accounts and OTR encryption) as well as WebRTC (text messages, file sending, video calls, screencasts...)
 * Basic word processor
 * Basic multimedia player
 * Music player (based on [GNOME Music](https://wiki.gnome.org/Apps/Music))
 * Основной веб-браузер
 * Терминал (с базовым интерпритатором)
 * Средство просмотра изображений, менеджер архива, программный центр ...
 * Настраиваемые темы, фон и т.д.
 * Несколько интерфейсов: Elementary OS, GNOME Shell, GNOME Panel (GNOME 2), Windows 7-like, mobile, CLI
 * Простая настройка с помощью приложения _System settings_ и простых файлов конфигурации
 * Dropbox, Google Drive, FTP, FTPS, SFTP (SSH) интеграция
 * [LDAP authentication](https://github.com/odinvolk/symbiose/wiki/LDAP-authentication) поддержка
 * Интеграция приложений Firefox Marketplace
 * Нативные приложения GTK3 могут отображаться на веб-сайте, используя [Broadway](https://github.com/odinvolk/symbiose/wiki/Broadway)
 * Доступно на английском, русском, французском, немецком, итальянском и испанском языках.
 * WebSocket поддержка
 * Может использоваться в автономном режиме (который просто требует статического сервера, не PHP)
 * И многое другое!

Демо
----

Вы можете попробовать Symbiose на нашем сайте: http://symbiose.fr.cr/ (username : _demo_, password : _demo_).

Bug tracker
-----------

Есть ошибка? Пожалуйста, создайте issui, на GitHub : https://github.com/odinvolk/symbiose/issues.

Установка
----------

Выполните следующую команду *nix:
```bash
curl -sS https://odinvolk.github.io/symbiose-installer/installer.sh | sh
```

В Windows или если вы предпочитаете ручную установку, см. https://github.com/odinvolk/symbiose/wiki/Установка.

Требования к ПО
---------------------

* Сервер: 
 * PHP >= 5.3
 * База данных: optional (по умолчанию выключена)
* Клиент: Любой современный веб браузер (e.g. the latest *Mozilla Firefox*). Тестировалось в:
 * Firefox (последняя версия)
 * Chromium (последняя версия)
 * Internet Explorer 10+, если вам повезет!

> **ПС**: Symbiose также может работать в автономном режиме, что не требует PHP.

Авторское право
---------

Symbiose is licensed under the MIT License (MIT). A copy of the license is available in `LICENSE`.
