#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import sys
import json
import re
from datetime import datetime
import requests


logger = logging.getLogger(__name__)
URL = 'https://api.github.com/users/'


def query(account):
    repos = []
    url = URL + account + '/starred'
    # TODO
    while url is not None:
    # if url is not None:
        ret_repos, url = _query(url)
        if type(ret_repos) is list:
            repos.extend(ret_repos)
    for r in repos:
        logger.info(r['full_name'] + ' ' + r['pushed_at'])
    logger.info('Number of repos: {0}'.format(len(repos)))
    return repos


def _query(url):
    resp = requests.get(url)
    if resp.ok:
        repos = resp.json()
        ret_repos = []
        for r in repos:
            tmp = {}
            tmp['full_name'] = r['full_name']
            tmp['pushed_at'] = r['pushed_at']
            tmp['html_url'] = r['html_url']
            ret_repos.append(tmp)
        logger.debug(json.dumps(repos, indent=2))
        logger.debug(resp.headers)
        links = resp.headers['link'].split(',')
        next_link = None
        for link in links:
            # link format like this:  '<https://xxxx>; rel="next"'
            m = re.match('\s*<(.+)>; rel="(\w+)"', link)
            if m is None:
                logger.error('Regex error: {0}'.format(link))
                sys.exit(1)
            logger.debug('regex parse link: {0}'.format(m.groups()))
            if m.group(2) == 'next':
                next_link = m.group(1)
                break
        return ret_repos, next_link
    return None, None


def date_filter(repos, days):
    ret_repos = []
    for r in repos:
        pushed_time = datetime.strptime(r['pushed_at'], '%Y-%m-%dT%H:%M:%SZ')
        now = datetime.now()
        dt = now - pushed_time
        if dt.days > days:
            ret_repos.append(r)
    return ret_repos


if __name__ == '__main__':
    formatter = logging.Formatter('%(levelname)s: %(message)s')
    console = logging.StreamHandler(stream=sys.stdout)
    console.setLevel(logging.DEBUG)
    console.setFormatter(formatter)
    logger.addHandler(console)
    logger.setLevel(logging.DEBUG)
    query('carlcarl')
