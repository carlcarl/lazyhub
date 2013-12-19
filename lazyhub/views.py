from django.shortcuts import render
import json
from django.http import HttpResponse
from libs import query, date_filter
from forms import QueryForm


def index(request):
    # data = {'account': False, 'days': False}
    data = {'error': {'account': False, 'days': False}}
    if request.is_ajax():
        if request.method == 'POST':
            form = QueryForm(request.POST)
            if form.is_valid():
                account = form.cleaned_data['account']
                days = form.cleaned_data['days']
                data['data'] = query(account)
                data['data'] = date_filter(data['data'], days)
            else:
                for k, v in data['error'].iteritems():
                    if k in form.errors:
                        data['error'][k] = True
        data = json.dumps(data)
        return HttpResponse(data, content_type='application/json')
    return render(request, 'lazyhub/index.html', data)
