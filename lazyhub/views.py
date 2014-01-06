from django.shortcuts import render
from django.views.decorators.http import require_http_methods
import json
from django.http import HttpResponse
from libs import github_query, date_filter
from forms import QueryForm


def index(request):
    return render(request, 'lazyhub/index.html')


@require_http_methods(['GET'])
def query(request, account, days):
    data = {'error': {'account': False, 'days': False}}
    if request.is_ajax():
        form = QueryForm({'account': account, 'days': days})
        if form.is_valid():
            account = form.cleaned_data['account']
            days = form.cleaned_data['days']
            data['data'] = github_query(account)
            data['data'] = date_filter(data['data'], days)
        else:
            for k, v in data['error'].iteritems():
                if k in form.errors:
                    data['error'][k] = True
        data = json.dumps(data)
    return HttpResponse(data, content_type='application/json')
