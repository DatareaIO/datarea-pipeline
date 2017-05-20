import chai from 'chai';
import Rx from 'rxjs';
import { download, downloadAll, __RewireAPI__ as ToDosRewireAPI } from '../src/platforms/ckan';
import { validateMetadata } from './database.test';

const expect = chai.expect;

describe('platfoms/ckan.js', () => {

  it('downloadAll() should return an observable of dataset stream.', (done) => {
    ToDosRewireAPI.__Rewire__('getDB', () => {
      return {
        query: () => Rx.Observable.create((observer) => {
          observer.next({ id: 1, url: 'testUrl' });
          observer.complete();
        })
      };
    });

    ToDosRewireAPI.__Rewire__('download', () => {
      return Rx.Observable.create((observer) => {
        observer.next({});
        observer.complete();
      });
    });

    let datasetCount = 0;

    downloadAll()
      .subscribe((data) => {
        expect(data).to.be.an('object');
        datasetCount += 1;
      },
      null,
      () => {
        expect(datasetCount).to.equal(1);
        done();
      });
  });

  it('download() should return an observable of dataset stream , with provided portal ID and URL.', (done) => {
    ToDosRewireAPI.__Rewire__('RxHR', {
      get: (url) => {
        if (url.endsWith('rows=0')) {
          return Rx.Observable.of({
            body: {
              result: {
                count: 1900
              }
            }
          });
        } else {
          return Rx.Observable.of({
            body: {
              result: {
                results: [
                  {
                    "license_title": "Alberta Queens Printer Terms of Use",
                    "maintainer": null,
                    "contactother": "780-427-4952",
                    "creator": [
                      "Government of Alberta"
                    ],
                    "relationships_as_object": [],
                    "sensitivity": "unrestricted",
                    "private": false,
                    "maintainer_email": null,
                    "num_tags": 4,
                    "identifier-ISBN-print": "9780779784158",
                    "issuedate": "2014-12-17 00:00:00",
                    "id": "e001ce44-3f3f-4cac-82ec-58e2fe026344",
                    "metadata_created": "2017-02-01T16:53:53.463197",
                    "metadata_modified": "2017-02-08T00:33:24.726402",
                    "author": null,
                    "author_email": null,
                    "isopen": true,
                    "audience": [
                      "General Public",
                      "Government",
                      "Legal and Law Enforcement Professionals"
                    ],
                    "placeofpub": "Edmonton",
                    "state": "active",
                    "version": null,
                    "creator_user_id": "2d73937b-632c-4451-b74f-1c95a37a6e63",
                    "type": "publications",
                    "email": "qp@gov.ab.ca",
                    "resources": [
                      {
                        "cache_last_updated": null,
                        "package_id": "e001ce44-3f3f-4cac-82ec-58e2fe026344",
                        "webstore_last_updated": null,
                        "id": "6e2b6149-873d-4334-9eae-482d24ccaf4b",
                        "size": null,
                        "title": "Youth Justice Act",
                        "state": "active",
                        "hash": "",
                        "description": "This act deals with procedures in Youth Court for contraventions of provincial laws and municipal bylaws, and provides for enforcement.",
                        "format": "HTML",
                        "time_coverage_from": "2014-12-17",
                        "tracking_summary": {
                          "total": 0,
                          "recent": 0
                        },
                        "mimetype_inner": null,
                        "url_type": null,
                        "mimetype": null,
                        "cache_url": null,
                        "name": "Youth Justice Act",
                        "created": "2017-02-07T17:33:24.783180",
                        "url": "http://www.qp.alberta.ca/570.cfm?frm_isbn=9780779784158&search_by=link",
                        "date_modified": "2014-12-17",
                        "webstore_url": null,
                        "last_modified": null,
                        "position": 0,
                        "revision_id": "eefa979a-7a54-4c66-a08a-31b5500ebd00",
                        "resource_type": null
                      }
                    ],
                    "updatefrequency": "Irregular",
                    "spatialcoverage": "Alberta",
                    "num_resources": 4,
                    "tags": [
                      {
                        "vocabulary_id": null,
                        "state": "active",
                        "display_name": "Administration of Justice",
                        "id": "7f870cba-144e-4650-a1c0-c7f341009152",
                        "name": "Administration of Justice"
                      }
                    ],
                    "createdate": "2014-12-17",
                    "time_coverage_from": "2014-12-17 00:00:00",
                    "tracking_summary": {
                      "total": 0,
                      "recent": 0
                    },
                    "groups": [],
                    "license_id": "QPTU",
                    "relationships_as_subject": [],
                    "topic": [
                      "Families and Children",
                      "Laws and Justice"
                    ],
                    "organization": {
                      "description": "",
                      "created": "2015-07-17T15:55:58.455966",
                      "title": "Queen's Printer",
                      "name": "queensprinter",
                      "is_organization": true,
                      "state": "active",
                      "image_url": "",
                      "revision_id": "e23cd3af-6f98-4569-951c-39dd44a45c2e",
                      "type": "organization",
                      "id": "09d2bf68-7eb8-40bb-96f6-9b6b1b050b10",
                      "approval_status": "approved"
                    },
                    "name": "y01",
                    "language": [
                      "en-CA [default]"
                    ],
                    "date_modified": "2014-12-17",
                    "url": null,
                    "notes": "This act deals with procedures in Youth Court for contraventions of provincial laws and municipal bylaws, and provides for enforcement.",
                    "owner_org": "09d2bf68-7eb8-40bb-96f6-9b6b1b050b10",
                    "pubtype": [
                      "Legislation and Regulations"
                    ],
                    "contact": "Alberta Queen's Printer",
                    "license_url": "http://www.qp.alberta.ca/copyright.cfm",
                    "title": "Youth Justice Act",
                    "revision_id": "eefa979a-7a54-4c66-a08a-31b5500ebd00"
                  }
                ]
              }
            }
          });
        }
      }
    });

    download(1, 'testUrl')
      .subscribe((result) => validateMetadata(result),
      null,
      () => done());
  });

});
