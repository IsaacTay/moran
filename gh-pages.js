import { publish } from 'gh-pages';

publish(
    'build',
    {
        dotfiles:true
    }
)